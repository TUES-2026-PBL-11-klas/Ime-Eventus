package com.eventus.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventus.server.entity.ApprovalRequest;

@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {

    List<ApprovalRequest> findByEventId(Long eventId);

    List<ApprovalRequest> findBySubmittedById(Long userId);
}
