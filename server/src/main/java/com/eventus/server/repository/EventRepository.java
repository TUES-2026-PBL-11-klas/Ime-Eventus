package com.eventus.server.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByStatusIn(List<EventStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithLock(@Param("id") UUID id);

    List<Event> findByOrganizerIdAndStatus(UUID organizerId, EventStatus status);

    List<Event> findByStartAtAfter(LocalDateTime dateTime);

    List<Event> findByStartAtBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByCategoryId(UUID categoryId);

    List<Event> findByRoomId(UUID roomId);
}
