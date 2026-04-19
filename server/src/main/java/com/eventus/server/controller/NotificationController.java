package com.eventus.server.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventus.server.dto.notification.NotificationResponse;
import com.eventus.server.entity.User;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = resolveUserId(userDetails.getUsername());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    private UUID resolveUserId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return user.getId();
    }
}
