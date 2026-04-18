package com.eventus.server.dto.approval;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalSubmitRequest {

    @NotNull(message = "Event ID is required")
    private UUID eventId;
}
