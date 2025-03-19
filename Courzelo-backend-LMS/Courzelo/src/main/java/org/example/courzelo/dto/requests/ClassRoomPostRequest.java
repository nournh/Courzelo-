package org.example.courzelo.dto.requests;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassRoomPostRequest {
    private String title;
    private String description;
}
