package com.eventus.server.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventus.server.dto.attendance.AttendanceResponse;
import com.eventus.server.dto.attendance.BulkAttendanceRequest;
import com.eventus.server.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/{id}/attendance")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> markAttendance(
            @PathVariable UUID id,
            @Valid @RequestBody BulkAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.markAttendance(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/attendance")
    @PreAuthorize("hasAnyRole('TEACHER', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> getAttendance(@PathVariable UUID id) {
        return ResponseEntity.ok(attendanceService.getEventAttendance(id));
    }
}
