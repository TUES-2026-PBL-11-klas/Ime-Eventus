package com.eventus.server.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.NotificationType;
import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;
import com.eventus.server.entity.User;
import com.eventus.server.entity.WaitlistEntry;
import com.eventus.server.exception.BadRequestException;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.RegistrationRepository;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.repository.WaitlistEntryRepository;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock private RegistrationRepository registrationRepository;
    @Mock private WaitlistEntryRepository waitlistEntryRepository;
    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private RegistrationService registrationService;

    private UUID eventId;
    private UUID studentId;
    private User student;
    private Event event;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        student = new User();
        student.setId(studentId);
        student.setEmail("student@test.com");
        student.setFullName("Test Student");

        event = new Event();
        event.setId(eventId);
        event.setTitle("Test Event");
        event.setStatus(EventStatus.APPROVED);
        event.setCapacity(10);
        event.setAllowWaitlist(false);
    }

    // ── register() ──────────────────────────────────────────────────────────────

    @Test
    void register_confirmsWhenCapacityAvailable() {
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)).thenReturn(5);

        Registration saved = new Registration();
        saved.setId(UUID.randomUUID());
        saved.setEvent(event);
        saved.setStudent(student);
        saved.setStatus(RegistrationStatus.CONFIRMED);
        when(registrationRepository.save(any())).thenReturn(saved);

        var result = registrationService.register(eventId, "student@test.com");

        assertThat(result.getStatus()).isEqualTo(RegistrationStatus.CONFIRMED);
        verify(notificationService).createForRegistration(student, event, saved, NotificationType.REGISTRATION_CONFIRMED);
    }

    @Test
    void register_waitlistsWhenFullAndWaitlistAllowed() {
        event.setCapacity(5);
        event.setAllowWaitlist(true);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)).thenReturn(5);
        when(waitlistEntryRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());
        when(waitlistEntryRepository.countByEventIdAndRemovedAtIsNull(eventId)).thenReturn(0);

        Registration saved = new Registration();
        saved.setId(UUID.randomUUID());
        saved.setEvent(event);
        saved.setStudent(student);
        saved.setStatus(RegistrationStatus.WAITLISTED);
        when(registrationRepository.save(any())).thenReturn(saved);
        when(waitlistEntryRepository.save(any())).thenReturn(new WaitlistEntry());

        var result = registrationService.register(eventId, "student@test.com");

        assertThat(result.getStatus()).isEqualTo(RegistrationStatus.WAITLISTED);
        verify(notificationService).createForRegistration(student, event, saved, NotificationType.REGISTRATION_WAITLISTED);
    }

    @Test
    void register_throwsWhenFullAndNoWaitlist() {
        event.setCapacity(5);
        event.setAllowWaitlist(false);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)).thenReturn(5);

        assertThatThrownBy(() -> registrationService.register(eventId, "student@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("fully booked");
    }

    @Test
    void register_throwsWhenDeadlinePassed() {
        event.setRegistrationDeadlineAt(LocalDateTime.now().minusHours(1));

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> registrationService.register(eventId, "student@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("deadline");
    }

    @Test
    void register_throwsWhenEventNotOpenForRegistration() {
        event.setStatus(EventStatus.DRAFT);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> registrationService.register(eventId, "student@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not open");
    }

    @Test
    void register_throwsWhenAlreadyRegistered() {
        Registration existing = new Registration();
        existing.setStatus(RegistrationStatus.CONFIRMED);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> registrationService.register(eventId, "student@test.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }

    // ── cancelRegistration() ────────────────────────────────────────────────────

    @Test
    void cancel_succeedsCancellingConfirmedRegistration() {
        Registration reg = new Registration();
        reg.setId(UUID.randomUUID());
        reg.setEvent(event);
        reg.setStudent(student);
        reg.setStatus(RegistrationStatus.CONFIRMED);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));
        when(registrationRepository.save(any())).thenReturn(reg);

        var result = registrationService.cancelRegistration(eventId, "student@test.com", "Changed mind");

        assertThat(result.getStatus()).isEqualTo(RegistrationStatus.CANCELLED);
    }

    @Test
    void cancel_throwsWhenAlreadyCancelled() {
        Registration reg = new Registration();
        reg.setStatus(RegistrationStatus.CANCELLED);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        assertThatThrownBy(() -> registrationService.cancelRegistration(eventId, "student@test.com", null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancel_throwsWhenDeadlinePassed() {
        event.setRegistrationDeadlineAt(LocalDateTime.now().minusHours(1));

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> registrationService.cancelRegistration(eventId, "student@test.com", null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("deadline");
    }

    @Test
    void cancel_removesWaitlistEntryWhenWaitlisted() {
        Registration reg = new Registration();
        reg.setId(UUID.randomUUID());
        reg.setEvent(event);
        reg.setStudent(student);
        reg.setStatus(RegistrationStatus.WAITLISTED);

        WaitlistEntry entry = new WaitlistEntry();
        entry.setId(UUID.randomUUID());
        entry.setEvent(event);
        entry.setStudent(student);
        entry.setPosition(1);

        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));
        when(registrationRepository.save(any())).thenReturn(reg);
        when(waitlistEntryRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(entry));
        when(waitlistEntryRepository.save(any())).thenReturn(entry);
        when(waitlistEntryRepository.findByEventIdAndRemovedAtIsNullOrderByPosition(eventId)).thenReturn(List.of());

        registrationService.cancelRegistration(eventId, "student@test.com", null);

        ArgumentCaptor<WaitlistEntry> captor = ArgumentCaptor.forClass(WaitlistEntry.class);
        verify(waitlistEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getRemovedAt()).isNotNull();
    }

    // ── promoteFromWaitlist() ────────────────────────────────────────────────────

    @Test
    void promote_succeedsWhenCapacityAvailable() {
        UUID entryId = UUID.randomUUID();

        WaitlistEntry entry = new WaitlistEntry();
        entry.setId(entryId);
        entry.setEvent(event);
        entry.setStudent(student);
        entry.setPosition(1);

        Registration reg = new Registration();
        reg.setId(UUID.randomUUID());
        reg.setEvent(event);
        reg.setStudent(student);
        reg.setStatus(RegistrationStatus.WAITLISTED);

        when(waitlistEntryRepository.findById(entryId)).thenReturn(Optional.of(entry));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)).thenReturn(8);
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));
        when(waitlistEntryRepository.save(any())).thenReturn(entry);
        when(registrationRepository.save(any())).thenReturn(reg);
        when(waitlistEntryRepository.findByEventIdAndRemovedAtIsNullOrderByPosition(eventId)).thenReturn(List.of());

        var result = registrationService.promoteFromWaitlist(eventId, entryId);

        assertThat(result.getStatus()).isEqualTo(RegistrationStatus.CONFIRMED);
        verify(notificationService).createForRegistration(student, event, reg, NotificationType.WAITLIST_PROMOTED);
    }

    @Test
    void promote_throwsWhenAlreadyPromoted() {
        UUID entryId = UUID.randomUUID();

        WaitlistEntry entry = new WaitlistEntry();
        entry.setId(entryId);
        entry.setEvent(event);
        entry.setStudent(student);
        entry.setPromotedAt(LocalDateTime.now().minusDays(1));

        when(waitlistEntryRepository.findById(entryId)).thenReturn(Optional.of(entry));

        assertThatThrownBy(() -> registrationService.promoteFromWaitlist(eventId, entryId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no longer active");
    }

    @Test
    void promote_throwsWhenEventStillFull() {
        UUID entryId = UUID.randomUUID();
        event.setCapacity(5);

        WaitlistEntry entry = new WaitlistEntry();
        entry.setId(entryId);
        entry.setEvent(event);
        entry.setStudent(student);
        entry.setPosition(1);

        when(waitlistEntryRepository.findById(entryId)).thenReturn(Optional.of(entry));
        when(eventRepository.findByIdWithLock(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED)).thenReturn(5);

        assertThatThrownBy(() -> registrationService.promoteFromWaitlist(eventId, entryId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("full capacity");
    }
}
