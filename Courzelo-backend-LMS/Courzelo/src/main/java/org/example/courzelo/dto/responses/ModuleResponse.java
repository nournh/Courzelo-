package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class ModuleResponse {
    private String id;
    private String name;
    private String description;
    private String institutionID;
    private String programID;
    private List<String> coursesID;
}
