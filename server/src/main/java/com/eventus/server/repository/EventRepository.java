package com.eventus.server.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByOrganizerIdAndStatus(Long organizerId, EventStatus status);

    List<Event> findByStartAtAfter(LocalDateTime dateTime);

    List<Event> findByStartAtBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByCategoryId(Long categoryId);

    List<Event> findByRoomId(Long roomId);
}
