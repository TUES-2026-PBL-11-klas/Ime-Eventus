package com.eventus.server.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.event.EventRequest;
import com.eventus.server.dto.event.EventResponse;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventCategory;
import com.eventus.server.entity.Room;
import com.eventus.server.entity.User;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.EventCategoryRepository;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.RoomRepository;
import com.eventus.server.repository.UserRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public EventService(
            EventRepository eventRepository,
            EventCategoryRepository categoryRepository,
            UserRepository userRepository,
            RoomRepository roomRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return mapToResponse(event);
    }

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOrganizerId()));

        Event event = new Event();
        applyRequest(event, request, organizer);
        Event saved = eventRepository.save(event);
        return mapToResponse(saved);
    }

    @Transactional
    public EventResponse updateEvent(UUID id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        User organizer = userRepository.findById(request.getOrganizerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOrganizerId()));

        applyRequest(event, request, organizer);
        Event saved = eventRepository.save(event);
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
