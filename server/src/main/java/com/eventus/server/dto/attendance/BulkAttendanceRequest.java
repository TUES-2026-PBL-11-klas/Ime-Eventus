package com.eventus.server.dto.attendance;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BulkAttendanceRequest {

    @NotEmpty
    @Valid
    private List<AttendanceItemRequest> items;
}
