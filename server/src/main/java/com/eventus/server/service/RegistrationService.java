package com.eventus.server.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.registration.RegistrationResponse;
import com.eventus.server.dto.registration.WaitlistEntryResponse;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.NotificationType;
import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;
import com.eventus.server.entity.User;
import com.eventus.server.entity.WaitlistEntry;
import com.eventus.server.exception.BadRequestException;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.RegistrationRepository;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.repository.WaitlistEntryRepository;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            WaitlistEntryRepository waitlistEntryRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.registrationRepository = registrationRepository;
        this.waitlistEntryRepository = waitlistEntryRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RegistrationResponse register(UUID eventId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", studentEmail));

        // Pessimistic lock prevents concurrent over-registration
        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (event.getStatus() != EventStatus.APPROVED && event.getStatus() != EventStatus.PUBLISHED) {
            throw new BadRequestException("Event is not open for registration");
        }

        if (event.getRegistrationDeadlineAt() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadlineAt())) {
            throw new BadRequestException("Registration deadline has passed");
        }

        Optional<Registration> existing = registrationRepository.findByEventIdAndStudentId(eventId, student.getId());
        if (existing.isPresent() && existing.get().getStatus() != RegistrationStatus.CANCELLED) {
            throw new BadRequestException("You are already registered for this event");
        }

        int confirmedCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);
        RegistrationStatus targetStatus;

        if (confirmedCount < event.getCapacity()) {
            targetStatus = RegistrationStatus.CONFIRMED;
        } else if (event.isAllowWaitlist()) {
            targetStatus = RegistrationStatus.WAITLISTED;
        } else {
            throw new BadRequestException("Event is fully booked");
        }

        Registration registration;
        if (existing.isPresent()) {
            registration = existing.get();
            registration.setStatus(targetStatus);
            registration.setCancelledAt(null);
            registration.setCancellationReason(null);
        } else {
            registration = new Registration();
            registration.setEvent(event);
            registration.setStudent(student);
            registration.setStatus(targetStatus);
        }
        registration = registrationRepository.save(registration);

        if (targetStatus == RegistrationStatus.WAITLISTED) {
            addToWaitlist(event, student);
        }

        NotificationType notifType = targetStatus == RegistrationStatus.CONFIRMED
                ? NotificationType.REGISTRATION_CONFIRMED
                : NotificationType.REGISTRATION_WAITLISTED;
        notificationService.createForRegistration(student, event, registration, notifType);

        return mapToResponse(registration);
    }

    @Transactional
    public RegistrationResponse cancelRegistration(UUID eventId, String studentEmail, String reason) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", studentEmail));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (event.getRegistrationDeadlineAt() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadlineAt())) {
            throw new BadRequestException("Cancellation deadline has passed");
        }

        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "event/student", eventId));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException("Registration is already cancelled");
        }

        RegistrationStatus previousStatus = registration.getStatus();
        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());
        registration.setCancellationReason(reason);
        registrationRepository.save(registration);

        if (previousStatus == RegistrationStatus.WAITLISTED) {
            waitlistEntryRepository.findByEventIdAndStudentId(eventId, student.getId()).ifPresent(entry -> {
                if (entry.getRemovedAt() == null) {
                    entry.setRemovedAt(LocalDateTime.now());
                    entry.setRemovalReason("Student cancelled registration");
                    waitlistEntryRepository.save(entry);
                }
            });
            reorderWaitlist(eventId);
        }

        notificationService.createForRegistration(student, event, registration, NotificationType.REGISTRATION_CANCELLED);

        return mapToResponse(registration);
    }

    @Transactional
    public RegistrationResponse promoteFromWaitlist(UUID eventId, UUID waitlistEntryId) {
        WaitlistEntry entry = waitlistEntryRepository.findById(waitlistEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitlistEntry", "id", waitlistEntryId));

        if (!entry.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Waitlist entry does not belong to this event");
        }

        if (entry.getRemovedAt() != null || entry.getPromotedAt() != null) {
            throw new BadRequestException("Waitlist entry is no longer active");
        }

        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        int confirmedCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);
        if (confirmedCount >= event.getCapacity()) {
            throw new BadRequestException("Event is still at full capacity");
        }

        entry.setPromotedAt(LocalDateTime.now());
        entry.setRemovedAt(LocalDateTime.now());
        entry.setRemovalReason("Promoted to confirmed");
        waitlistEntryRepository.save(entry);

        User student = entry.getStudent();
        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "event/student", eventId));

        registration.setStatus(RegistrationStatus.CONFIRMED);
        registrationRepository.save(registration);

        reorderWaitlist(eventId);

        notificationService.createForRegistration(student, event, registration, NotificationType.WAITLIST_PROMOTED);

        return mapToResponse(registration);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getEventRegistrations(UUID eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getStudentRegistrations(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", studentEmail));
        return registrationRepository.findByStudentId(student.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> getEventWaitlist(UUID eventId) {
        return waitlistEntryRepository.findByEventIdAndRemovedAtIsNullOrderByPosition(eventId).stream()
                .map(this::mapToWaitlistResponse)
                .toList();
    }

    private void addToWaitlist(Event event, User student) {
        Optional<WaitlistEntry> existing = waitlistEntryRepository
                .findByEventIdAndStudentId(event.getId(), student.getId());
        if (existing.isPresent() && existing.get().getRemovedAt() == null) {
            return;
        }
        int nextPosition = waitlistEntryRepository.countByEventIdAndRemovedAtIsNull(event.getId()) + 1;
        WaitlistEntry entry = new WaitlistEntry();
        entry.setEvent(event);
        entry.setStudent(student);
        entry.setPosition(nextPosition);
        waitlistEntryRepository.save(entry);
    }

    private void reorderWaitlist(UUID eventId) {
        List<WaitlistEntry> active = waitlistEntryRepository
                .findByEventIdAndRemovedAtIsNullOrderByPosition(eventId);
        for (int i = 0; i < active.size(); i++) {
            active.get(i).setPosition(i + 1);
        }
        waitlistEntryRepository.saveAll(active);
    }

    private RegistrationResponse mapToResponse(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getEvent().getId(),
                r.getEvent().getTitle(),
                r.getEvent().getStartAt(),
                r.getEvent().getEndAt(),
                r.getStudent().getId(),
                r.getStudent().getFullName(),
                r.getStatus(),
                r.getRegisteredAt(),
                r.getCancelledAt(),
                r.getCancellationReason()
        );
    }

    private WaitlistEntryResponse mapToWaitlistResponse(WaitlistEntry e) {
        return new WaitlistEntryResponse(
                e.getId(),
                e.getEvent().getId(),
                e.getEvent().getTitle(),
                e.getStudent().getId(),
                e.getStudent().getFullName(),
                e.getPosition(),
                e.getJoinedAt(),
                e.getPromotedAt()
        );
    }
}
