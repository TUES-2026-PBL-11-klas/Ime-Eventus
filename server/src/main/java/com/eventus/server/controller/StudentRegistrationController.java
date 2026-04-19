package com.eventus.server.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventus.server.dto.registration.RegistrationResponse;
import com.eventus.server.service.RegistrationService;

@RestController
@RequestMapping("/api/registrations")
public class StudentRegistrationController {

    private final RegistrationService registrationService;

    public StudentRegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(registrationService.getStudentRegistrations(userDetails.getUsername()));
    }
}
