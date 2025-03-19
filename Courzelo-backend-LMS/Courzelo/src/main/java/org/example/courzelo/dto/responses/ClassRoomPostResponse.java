package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ClassRoomPostResponse {
    private String id;
    private String title;
    private String description;
    private LocalDateTime created;
    private List<String> files;
}
