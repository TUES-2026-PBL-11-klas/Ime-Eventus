package com.eventus.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.Coordinator;

@Repository
public interface CoordinatorRepository extends JpaRepository<Coordinator, Long> {
}
