package org.example.courzelo.dto.requests;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ModuleRequest {
    private String name;
    private String description;
    private String programID;
    private String institutionID;
    private List<String> coursesID;
}
