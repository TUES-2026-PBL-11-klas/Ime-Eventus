package com.eventus.server.dto.notification;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private NotificationType type;
    private UUID eventId;
    private String eventTitle;
    private String title;
    private String body;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
