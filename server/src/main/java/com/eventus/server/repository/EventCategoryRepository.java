package com.eventus.server.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.EventCategory;

@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategory, UUID> {

    Optional<EventCategory> findByName(String name);

    boolean existsByName(String name);

    List<EventCategory> findByActiveTrue();
}
