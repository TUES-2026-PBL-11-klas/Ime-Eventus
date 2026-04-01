package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.AttendanceRecord;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByEventId(Long eventId);

    List<AttendanceRecord> findByStudentId(Long studentId);

    Optional<AttendanceRecord> findByEventIdAndStudentId(Long eventId, Long studentId);

    int countByEventIdAndIsPresent(Long eventId, boolean isPresent);

    List<AttendanceRecord> findByEventIdAndIsPresent(Long eventId, boolean isPresent);
}
