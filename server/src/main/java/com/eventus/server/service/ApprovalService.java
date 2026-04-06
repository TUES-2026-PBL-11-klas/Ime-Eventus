package com.eventus.server.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.approval.ApprovalResponse;
import com.eventus.server.entity.ApprovalRequest;
import com.eventus.server.entity.ApprovalStatus;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.User;
import com.eventus.server.exception.BadRequestException;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.ApprovalRequestRepository;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.UserRepository;

@Service
public class ApprovalService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public ApprovalService(
            ApprovalRequestRepository approvalRequestRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.approvalRequestRepository = approvalRequestRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApprovalResponse submit(UUID eventId, UUID submitterId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User submitter = userRepository.findById(submitterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", submitterId));

        if (!event.getOrganizer().getId().equals(submitterId)) {
            throw new BadRequestException("Only the event organizer can submit this event for approval");
        }

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BadRequestException("Only events in DRAFT status can be submitted for approval");
        }

        if (approvalRequestRepository.existsByEventIdAndStatus(eventId, ApprovalStatus.PENDING)) {
            throw new BadRequestException("This event already has a pending approval request");
        }

        ApprovalRequest request = new ApprovalRequest();
        request.setEvent(event);
        request.setSubmittedBy(submitter);

        ApprovalRequest saved = approvalRequestRepository.save(request);

        event.setStatus(EventStatus.PENDING_APPROVAL);
        eventRepository.save(event);

        return mapToResponse(saved);
    }

    @Transactional
    public ApprovalResponse approve(UUID approvalRequestId, UUID reviewerId) {
        ApprovalRequest request = approvalRequestRepository.findById(approvalRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalRequest", "id", approvalRequestId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Only pending approval requests can be approved");
        }

        request.setStatus(ApprovalStatus.APPROVED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());

        Event event = request.getEvent();
        event.setStatus(EventStatus.APPROVED);

        eventRepository.save(event);
        ApprovalRequest saved = approvalRequestRepository.save(request);

        return mapToResponse(saved);
    }

    @Transactional
    public ApprovalResponse reject(UUID approvalRequestId, UUID reviewerId, String rejectionReason) {
        ApprovalRequest request = approvalRequestRepository.findById(approvalRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalRequest", "id", approvalRequestId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Only pending approval requests can be rejected");
        }

        request.setStatus(ApprovalStatus.REJECTED);
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);

        Event event = request.getEvent();
        event.setStatus(EventStatus.DRAFT);

        eventRepository.save(event);
        ApprovalRequest saved = approvalRequestRepository.save(request);

        return mapToResponse(saved);
    }

    private ApprovalResponse mapToResponse(ApprovalRequest request) {
        Event event = request.getEvent();
        User submittedBy = request.getSubmittedBy();
        User reviewedBy = request.getReviewedBy();

        UUID reviewedById = reviewedBy != null ? reviewedBy.getId() : null;
        String reviewedByName = reviewedBy != null ? reviewedBy.getFullName() : null;

        return new ApprovalResponse(
                request.getId(),
                event.getId(),
                event.getTitle(),
                request.getStatus(),
                submittedBy.getId(),
                submittedBy.getFullName(),
                request.getSubmittedAt(),
                reviewedById,
                reviewedByName,
                request.getReviewedAt(),
                request.getRejectionReason()
        );
    }
}
