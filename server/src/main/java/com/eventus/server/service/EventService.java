package com.eventus.server.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.event.EventRequest;
import com.eventus.server.dto.event.EventResponse;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventCategory;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.EventStatusHistory;
import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;
import com.eventus.server.entity.Room;
import com.eventus.server.entity.User;
import com.eventus.server.exception.BadRequestException;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.EventCategoryRepository;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.EventStatusHistoryRepository;
import com.eventus.server.repository.RegistrationRepository;
import com.eventus.server.repository.RoomRepository;
import com.eventus.server.repository.UserRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final EventStatusHistoryRepository statusHistoryRepository;

    public EventService(
            EventRepository eventRepository,
            EventCategoryRepository categoryRepository,
            UserRepository userRepository,
            RoomRepository roomRepository,
            RegistrationRepository registrationRepository,
            NotificationService notificationService,
            EventStatusHistoryRepository statusHistoryRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getCatalogEvents(Authentication authentication) {
        boolean isStudent = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        List<EventStatus> statuses = isStudent
                ? List.of(EventStatus.APPROVED)
                : List.of(EventStatus.APPROVED, EventStatus.PUBLISHED);
        return eventRepository.findByStatusIn(statuses).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return mapToResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getMyEvents(UUID organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", organizerId));
        return eventRepository.findAll().stream()
                .filter(e -> e.getOrganizer().getId().equals(organizer.getId()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public EventResponse createEvent(EventRequest request, UUID changedById) {
        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOrganizerId()));

        User changedBy = userRepository.findById(changedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", changedById));

        Event event = new Event();
        applyRequest(event, request, organizer);
        Event saved = eventRepository.save(event);

        recordHistory(saved, null, saved.getStatus(), changedBy, null);

        return mapToResponse(saved);
    }

    @Transactional
    public EventResponse updateEvent(UUID id, EventRequest request, UUID changedById) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOrganizerId()));

        User changedBy = userRepository.findById(changedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", changedById));

        EventStatus previousStatus = event.getStatus();
        applyRequest(event, request, organizer);
        Event saved = eventRepository.save(event);

        if (previousStatus != saved.getStatus()) {
            recordHistory(saved, previousStatus, saved.getStatus(), changedBy, null);
        }

        List<Registration> active = registrationRepository.findByEventIdAndStatusIn(
                id, List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLISTED));
        if (!active.isEmpty()) {
            notificationService.createForEventUpdate(saved, active);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void cancelEvent(UUID id, UUID changedById) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BadRequestException("Event is already cancelled");
        }

        User changedBy = userRepository.findById(changedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", changedById));

        EventStatus previousStatus = event.getStatus();
        event.setStatus(EventStatus.CANCELLED);
        event.setCancelledAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        recordHistory(saved, previousStatus, EventStatus.CANCELLED, changedBy, null);

        List<Registration> active = registrationRepository.findByEventIdAndStatusIn(
                id, List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.WAITLISTED));
        if (!active.isEmpty()) {
            notificationService.createForEventCancellation(saved, active);
        }
    }

    @Transactional
    public EventResponse publishEvent(UUID id, UUID changedById) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (event.getStatus() != EventStatus.APPROVED) {
            throw new BadRequestException("Only approved events can be published");
        }

        User changedBy = userRepository.findById(changedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", changedById));

        event.setStatus(EventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        recordHistory(saved, EventStatus.APPROVED, EventStatus.PUBLISHED, changedBy, null);

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        eventRepository.delete(event);
    }

    private void applyRequest(Event event, EventRequest request, User organizer) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(resolveCategory(request.getCategoryId()));
        event.setStatus(request.getStatus());
        event.setOrganizer(organizer);
        event.setRoom(resolveRoom(request.getRoomId()));
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setCapacity(request.getCapacity());
        event.setAllowWaitlist(request.isAllowWaitlist());
        event.setRegistrationDeadlineAt(request.getRegistrationDeadlineAt());
    }

    void recordHistory(Event event, EventStatus fromStatus, EventStatus toStatus, User changedBy, String reason) {
        EventStatusHistory history = new EventStatusHistory();
        history.setEvent(event);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setChangedBy(changedBy);
        history.setReason(reason);
        statusHistoryRepository.save(history);
    }

    private EventCategory resolveCategory(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }

    private Room resolveRoom(UUID roomId) {
        if (roomId == null) {
            return null;
        }
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
    }

    private EventResponse mapToResponse(Event event) {
        UUID categoryId = null;
        String categoryName = null;
        if (event.getCategory() != null) {
            categoryId = event.getCategory().getId();
            categoryName = event.getCategory().getName();
        }

        UUID roomId = null;
        String roomName = null;
        if (event.getRoom() != null) {
            roomId = event.getRoom().getId();
            roomName = event.getRoom().getName();
        }

        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                categoryId,
                categoryName,
                event.getStatus(),
                event.getOrganizer().getId(),
                event.getOrganizer().getFullName(),
                roomId,
                roomName,
                event.getStartAt(),
                event.getEndAt(),
                event.getCapacity(),
                event.isAllowWaitlist(),
                event.getRegistrationDeadlineAt(),
                event.getCreatedAt(),
                event.getUpdatedAt(),
                event.getPublishedAt(),
                event.getCancelledAt()
        );
    }
}
