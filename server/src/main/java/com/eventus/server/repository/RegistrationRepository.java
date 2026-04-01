package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Registration;
import com.eventus.server.entity.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByEventId(Long eventId);

    List<Registration> findByStudentId(Long studentId);

    List<Registration> findByStatus(RegistrationStatus status);

    Optional<Registration> findByEventIdAndStudentId(Long eventId, Long studentId);

    int countByEventId(Long eventId);

    List<Registration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);
}
