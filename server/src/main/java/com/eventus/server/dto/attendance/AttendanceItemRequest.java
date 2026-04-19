package com.eventus.server.dto.attendance;

import java.util.UUID;

import com.eventus.server.entity.AttendanceStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceItemRequest {

    @NotNull
    private UUID studentId;

    @NotNull
    private AttendanceStatus status;

    private String note;
}
