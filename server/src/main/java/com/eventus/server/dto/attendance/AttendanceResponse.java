package com.eventus.server.dto.attendance;

import java.time.LocalDateTime;
import java.util.UUID;

import com.eventus.server.entity.AttendanceStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private UUID id;
    private UUID eventId;
    private UUID studentId;
    private String studentName;
    private AttendanceStatus status;
    private UUID markedById;
    private String markedByName;
    private LocalDateTime markedAt;
    private String note;
}
