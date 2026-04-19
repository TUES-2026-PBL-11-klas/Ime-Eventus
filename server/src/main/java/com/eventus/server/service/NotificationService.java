package com.eventus.server.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.notification.NotificationResponse;
import com.eventus.server.entity.AttendanceRecord;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.Notification;
import com.eventus.server.entity.NotificationType;
import com.eventus.server.entity.Registration;
import com.eventus.server.entity.User;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.exception.UnauthorizedException;
import com.eventus.server.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createForRegistration(User recipient, Event event, Registration registration, NotificationType type) {
        String title;
        String body;

        switch (type) {
            case REGISTRATION_CONFIRMED -> {
                title = "Registration Confirmed";
                body = "You have been successfully registered for \"" + event.getTitle() + "\"";
            }
            case REGISTRATION_WAITLISTED -> {
                title = "Added to Waitlist";
                body = "You have been added to the waitlist for \"" + event.getTitle() + "\"";
            }
            case REGISTRATION_CANCELLED -> {
                title = "Registration Cancelled";
                body = "Your registration for \"" + event.getTitle() + "\" has been cancelled";
            }
            case WAITLIST_PROMOTED -> {
                title = "Waitlist Promotion";
                body = "Great news! You have been moved from the waitlist to confirmed for \"" + event.getTitle() + "\"";
            }
            default -> {
                title = "Registration Update";
                body = "Your registration status has been updated for \"" + event.getTitle() + "\"";
            }
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setEvent(event);
        notification.setRegistration(registration);
        notification.setTitle(title);
        notification.setBody(body);

        notificationRepository.save(notification);
    }

    public void createForEventCancellation(Event event, List<Registration> registrations) {
        for (Registration reg : registrations) {
            Notification notification = new Notification();
            notification.setRecipient(reg.getStudent());
            notification.setType(NotificationType.EVENT_CANCELLED);
            notification.setEvent(event);
            notification.setRegistration(reg);
            notification.setTitle("Event Cancelled");
            notification.setBody("\"" + event.getTitle() + "\" has been cancelled.");
            notificationRepository.save(notification);
        }
    }

    public void createForEventUpdate(Event event, List<Registration> registrations) {
        for (Registration reg : registrations) {
            Notification notification = new Notification();
            notification.setRecipient(reg.getStudent());
            notification.setType(NotificationType.EVENT_UPDATED);
            notification.setEvent(event);
            notification.setRegistration(reg);
            notification.setTitle("Event Updated");
            notification.setBody("\"" + event.getTitle() + "\" has been updated. Please review the changes.");
            notificationRepository.save(notification);
        }
    }

    public void createForAttendance(User recipient, Event event, AttendanceRecord record) {
        String statusLabel = switch (record.getStatus()) {
            case PRESENT -> "present";
            case ABSENT -> "absent";
            case EXCUSED -> "excused";
        };

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(NotificationType.ATTENDANCE_MARKED);
        notification.setEvent(event);
        notification.setTitle("Attendance Recorded");
        notification.setBody("Your attendance for \"" + event.getTitle() + "\" has been marked as " + statusLabel);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findByRecipientId(userId).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public int getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndReadAtIsNull(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new UnauthorizedException("You can only mark your own notifications as read");
        }

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadAtIsNull(userId);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> n.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        UUID eventId = notification.getEvent() != null ? notification.getEvent().getId() : null;
        String eventTitle = notification.getEvent() != null ? notification.getEvent().getTitle() : null;

        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                eventId,
                eventTitle,
                notification.getTitle(),
                notification.getBody(),
                notification.getReadAt() != null,
                notification.getCreatedAt(),
                notification.getReadAt()
        );
    }
}
