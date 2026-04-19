package com.eventus.server.dto.registration;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistEntryResponse {

    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private UUID studentId;
    private String studentName;
    private int position;
    private LocalDateTime joinedAt;
    private LocalDateTime promotedAt;
}
