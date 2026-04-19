package com.eventus.server.dto.registration;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CancelRegistrationRequest {

    private String reason;
}
