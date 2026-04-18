package com.eventus.server.dto.approval;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RejectApprovalRequest {

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}
