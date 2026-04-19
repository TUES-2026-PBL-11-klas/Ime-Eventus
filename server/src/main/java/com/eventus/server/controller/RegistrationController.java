package com.eventus.server.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Note: student self-service endpoint GET /api/registrations/my lives in StudentRegistrationController

import com.eventus.server.dto.registration.CancelRegistrationRequest;
import com.eventus.server.dto.registration.RegistrationResponse;
import com.eventus.server.dto.registration.WaitlistEntryResponse;
import com.eventus.server.service.RegistrationService;

@RestController
@RequestMapping("/api/events")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponse> register(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.register(id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponse> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) CancelRegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(registrationService.cancelRegistration(id, userDetails.getUsername(), reason));
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getRegistrations(@PathVariable UUID id) {
        return ResponseEntity.ok(registrationService.getEventRegistrations(id));
    }

    @GetMapping("/{id}/waitlist")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<WaitlistEntryResponse>> getWaitlist(@PathVariable UUID id) {
        return ResponseEntity.ok(registrationService.getEventWaitlist(id));
    }

    @PostMapping("/{id}/waitlist/{entryId}/promote")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<RegistrationResponse> promoteFromWaitlist(
            @PathVariable UUID id,
            @PathVariable UUID entryId) {
        return ResponseEntity.ok(registrationService.promoteFromWaitlist(id, entryId));
    }
}
