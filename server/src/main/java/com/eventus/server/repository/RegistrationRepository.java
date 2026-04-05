package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    List<Registration> findByEventId(UUID eventId);

    List<Registration> findByStudentId(UUID studentId);

    List<Registration> findByStatus(RegistrationStatus status);

    Optional<Registration> findByEventIdAndStudentId(UUID eventId, UUID studentId);

    int countByEventId(UUID eventId);

    List<Registration> findByEventIdAndStatus(UUID eventId, RegistrationStatus status);
}
