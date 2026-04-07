package com.eventus.server.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.EventStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private UUID id;
    private String title;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private EventStatus status;
    private UUID organizerId;
    private String organizerName;
    private UUID roomId;
    private String roomName;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private int capacity;
    private boolean allowWaitlist;
    private LocalDateTime registrationDeadlineAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime cancelledAt;
}
