package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.WaitlistEntry;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, Long> {

    List<WaitlistEntry> findByEventId(Long eventId);

    List<WaitlistEntry> findByStudentId(Long studentId);

    Optional<WaitlistEntry> findByEventIdAndStudentId(Long eventId, Long studentId);

    int countByEventId(Long eventId);

    List<WaitlistEntry> findByEventIdOrderByPosition(Long eventId);
}
