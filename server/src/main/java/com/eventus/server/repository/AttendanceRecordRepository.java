package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.AttendanceRecord;
import com.eventus.server.entity.AttendanceStatus;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    List<AttendanceRecord> findByEventId(UUID eventId);

    List<AttendanceRecord> findByStudentId(UUID studentId);

    Optional<AttendanceRecord> findByEventIdAndStudentId(UUID eventId, UUID studentId);

    int countByEventIdAndStatus(UUID eventId, AttendanceStatus status);

    List<AttendanceRecord> findByEventIdAndStatus(UUID eventId, AttendanceStatus status);
}
