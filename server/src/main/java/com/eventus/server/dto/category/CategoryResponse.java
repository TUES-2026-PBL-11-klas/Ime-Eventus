package com.eventus.server.dto.category;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String color;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
