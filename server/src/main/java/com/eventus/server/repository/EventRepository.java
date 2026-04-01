package com.eventus.server.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByOrganizerIdAndStatus(UUID organizerId, EventStatus status);

    List<Event> findByStartAtAfter(LocalDateTime dateTime);

    List<Event> findByStartAtBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByCategoryId(UUID categoryId);

    List<Event> findByRoomId(UUID roomId);
}
