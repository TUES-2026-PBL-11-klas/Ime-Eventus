package com.eventus.server.dto.event;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.EventStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @Size(max = 10000)
    private String description;

    private UUID categoryId;

    @NotNull(message = "Status is required")
    private EventStatus status;

    @NotNull(message = "Organizer is required")
    private UUID organizerId;

    private UUID roomId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startAt;

    @NotNull(message = "End time is required")
    private LocalDateTime endAt;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    private boolean allowWaitlist;

    private LocalDateTime registrationDeadlineAt;

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndAfterStart() {
        if (startAt == null || endAt == null) {
            return true;
        }
        return endAt.isAfter(startAt);
    }
}
