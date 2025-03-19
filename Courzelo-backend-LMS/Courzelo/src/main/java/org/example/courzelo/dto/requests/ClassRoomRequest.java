package org.example.courzelo.dto.requests;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassRoomRequest {
    private String name;
    private String description;
    private String course;
    private int credit;
    private String group;
    private String teacher;
}
