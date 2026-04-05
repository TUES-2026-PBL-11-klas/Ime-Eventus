package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.WaitlistEntry;

@Repository
public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {

    List<WaitlistEntry> findByEventId(UUID eventId);

    List<WaitlistEntry> findByStudentId(UUID studentId);

    Optional<WaitlistEntry> findByEventIdAndStudentId(UUID eventId, UUID studentId);

    int countByEventId(UUID eventId);

    List<WaitlistEntry> findByEventIdOrderByPosition(UUID eventId);
}
