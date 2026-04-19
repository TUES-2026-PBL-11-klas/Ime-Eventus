package com.eventus.server.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventus.server.dto.event.EventRequest;
import com.eventus.server.dto.event.EventResponse;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public EventController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/catalog")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<EventResponse>> getCatalogEvents(Authentication authentication) {
        return ResponseEntity.ok(eventService.getCatalogEvents(authentication));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents() {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(eventService.getMyEvents(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<EventResponse> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(eventService.createEvent(request, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable UUID id,
                                                     @Valid @RequestBody EventRequest request) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(eventService.updateEvent(id, request, userId));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<EventResponse> publishEvent(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        return ResponseEntity.ok(eventService.publishEvent(id, userId));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<Void> cancelEvent(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        eventService.cancelEvent(id, userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"))
                .getId();
    }
}
