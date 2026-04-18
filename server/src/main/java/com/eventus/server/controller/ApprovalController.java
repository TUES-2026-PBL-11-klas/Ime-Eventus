package com.eventus.server.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventus.server.dto.approval.ApprovalResponse;
import com.eventus.server.dto.approval.ApprovalSubmitRequest;
import com.eventus.server.dto.approval.RejectApprovalRequest;
import com.eventus.server.repository.UserRepository;
import com.eventus.server.service.ApprovalService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    public ApprovalController(ApprovalService approvalService, UserRepository userRepository) {
        this.approvalService = approvalService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApprovalResponse> submitForApproval(
            @Valid @RequestBody ApprovalSubmitRequest request) {
        UUID userId = getCurrentUserId();
        ApprovalResponse response = approvalService.submit(request.getEventId(), userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApprovalResponse> approveRequest(@PathVariable UUID id) {
        UUID userId = getCurrentUserId();
        ApprovalResponse response = approvalService.approve(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApprovalResponse> rejectRequest(
            @PathVariable UUID id,
            @Valid @RequestBody RejectApprovalRequest request) {
        UUID userId = getCurrentUserId();
        ApprovalResponse response = approvalService.reject(id, userId, request.getRejectionReason());
        return ResponseEntity.ok(response);
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"))
                .getId();
    }
}
