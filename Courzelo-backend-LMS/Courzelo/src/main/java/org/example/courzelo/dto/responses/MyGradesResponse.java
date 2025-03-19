package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MyGradesResponse {
    private List<ModuleGradesResponse> grades;
    private double average;
}
