package com.eventus.server.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.attendance.AttendanceItemRequest;
import com.eventus.server.dto.attendance.AttendanceResponse;
import com.eventus.server.dto.attendance.BulkAttendanceRequest;
import com.eventus.server.entity.AttendanceRecord;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.User;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.AttendanceRecordRepository;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.UserRepository;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AttendanceService(
            AttendanceRecordRepository attendanceRecordRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public List<AttendanceResponse> markAttendance(UUID eventId, BulkAttendanceRequest request, String markedByEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User markedBy = userRepository.findByEmail(markedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", markedByEmail));

        List<AttendanceRecord> saved = new ArrayList<>();

        for (AttendanceItemRequest item : request.getItems()) {
            User student = userRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", item.getStudentId()));

            AttendanceRecord record = attendanceRecordRepository
                    .findByEventIdAndStudentId(eventId, item.getStudentId())
                    .orElseGet(AttendanceRecord::new);

            record.setEvent(event);
            record.setStudent(student);
            record.setStatus(item.getStatus());
            record.setMarkedBy(markedBy);
            record.setNote(item.getNote());

            saved.add(attendanceRecordRepository.save(record));
            notificationService.createForAttendance(student, event, record);
        }

        return saved.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getEventAttendance(UUID eventId) {
        return attendanceRecordRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AttendanceResponse mapToResponse(AttendanceRecord record) {
        User student = record.getStudent();
        User markedBy = record.getMarkedBy();
        return new AttendanceResponse(
                record.getId(),
                record.getEvent().getId(),
                student.getId(),
                student.getFullName(),
                record.getStatus(),
                markedBy != null ? markedBy.getId() : null,
                markedBy != null ? markedBy.getFullName() : null,
                record.getMarkedAt(),
                record.getNote()
        );
    }
}
