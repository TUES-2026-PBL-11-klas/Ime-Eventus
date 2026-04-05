package com.eventus.server.dto.category;

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
public class CategoryResponse {

    private UUID id;
    private String name;
    private String description;
    private String color;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
