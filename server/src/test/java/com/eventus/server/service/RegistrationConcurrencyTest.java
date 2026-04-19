package com.eventus.server.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;
import com.eventus.server.entity.User;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.RegistrationRepository;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.repository.WaitlistEntryRepository;

/**
 * Verifies that the pessimistic-lock path (findByIdWithLock) is invoked during
 * registration, and that concurrent callers are serialised at the service level.
 *
 * Because this is a unit test (no real DB), we verify:
 *   1. findByIdWithLock is called — confirming the locking codepath is exercised.
 *   2. Under simulated concurrency (CountDownLatch), all threads complete without
 *      data races inside the service itself (mocks are thread-safe).
 *   3. The number of CONFIRMED saves never exceeds the event capacity.
 */
@ExtendWith(MockitoExtension.class)
class RegistrationConcurrencyTest {

    @Mock private RegistrationRepository registrationRepository;
    @Mock private WaitlistEntryRepository waitlistEntryRepository;
    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private RegistrationService registrationService;

    private static final int CAPACITY = 3;
    private static final int THREAD_COUNT = 6;

    private UUID eventId;
    private Event event;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();

        event = new Event();
        event.setId(eventId);
        event.setTitle("Concurrent Event");
        event.setStatus(EventStatus.APPROVED);
        event.setCapacity(CAPACITY);
        event.setAllowWaitlist(false);
    }

    @Test
    void findByIdWithLock_isCalledDuringRegistration() {
        User student = makeStudent(0);
        Registration saved = makeSavedRegistration(student, RegistrationStatus.CONFIRMED);

        when(userRepository.findByEmail(student.getEmail())).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, student.getId()))
                .thenReturn(Optional.empty());
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED))
                .thenReturn(0);
        when(registrationRepository.save(any())).thenReturn(saved);

        registrationService.register(eventId, student.getEmail());

        // The key invariant: pessimistic lock is acquired via this method
        verify(eventRepository, atLeastOnce()).findByIdWithLock(eventId);
    }

    @Test
    void concurrentRegistrations_neverExceedCapacity() throws Exception {
        // Each thread gets its own distinct student
        List<User> students = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            students.add(makeStudent(i));
        }

        // Shared confirmed counter — simulates what a real DB row lock would enforce
        AtomicInteger confirmedCount = new AtomicInteger(0);

        for (User s : students) {
            Registration saved = makeSavedRegistration(s, RegistrationStatus.CONFIRMED);
            when(userRepository.findByEmail(s.getEmail())).thenReturn(Optional.of(s));
            when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
            when(registrationRepository.findByEventIdAndStudentId(eventId, s.getId()))
                    .thenReturn(Optional.empty());
            // countByEventIdAndStatus returns the current shared count for this student's thread
            when(registrationRepository.countByEventIdAndStatus(eq(eventId), eq(RegistrationStatus.CONFIRMED)))
                    .thenAnswer(inv -> confirmedCount.get());
            when(registrationRepository.save(any())).thenAnswer(inv -> {
                Registration r = inv.getArgument(0);
                if (r.getStatus() == RegistrationStatus.CONFIRMED) {
                    confirmedCount.incrementAndGet();
                }
                return saved;
            });
        }

        CountDownLatch ready = new CountDownLatch(THREAD_COUNT);
        CountDownLatch go = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(THREAD_COUNT);
        List<Future<?>> futures = new ArrayList<>();

        for (User s : students) {
            futures.add(pool.submit(() -> {
                ready.countDown();
                try {
                    go.await();
                    registrationService.register(eventId, s.getEmail());
                } catch (Exception ignored) {
                    // BadRequestException expected for threads that arrive after capacity is full
                }
            }));
        }

        ready.await();
        go.countDown();

        for (Future<?> f : futures) {
            f.get();
        }
        pool.shutdown();

        // Confirmed count must never exceed capacity — the lock enforces this in production
        assertThat(confirmedCount.get()).isLessThanOrEqualTo(CAPACITY);
    }

    private User makeStudent(int index) {
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setEmail("student" + index + "@test.com");
        u.setFullName("Student " + index);
        return u;
    }

    private Registration makeSavedRegistration(User student, RegistrationStatus status) {
        Registration r = new Registration();
        r.setId(UUID.randomUUID());
        r.setEvent(event);
        r.setStudent(student);
        r.setStatus(status);
        return r;
    }
}
