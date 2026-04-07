package com.eventus.server.dto.approval;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.ApprovalStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalResponse {

    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private ApprovalStatus status;
    private UUID submittedById;
    private String submittedByName;
    private LocalDateTime submittedAt;
    private UUID reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
}
