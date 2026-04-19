package com.eventus.server.dto.registration;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.RegistrationStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {

    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private LocalDateTime eventStartAt;
    private LocalDateTime eventEndAt;
    private UUID studentId;
    private String studentName;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
}
