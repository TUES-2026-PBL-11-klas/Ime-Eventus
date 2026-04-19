package com.eventus.server.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.EventStatusHistory;

@Repository
public interface EventStatusHistoryRepository extends JpaRepository<EventStatusHistory, UUID> {

    List<EventStatusHistory> findByEventIdOrderByChangedAtAsc(UUID eventId);
}
