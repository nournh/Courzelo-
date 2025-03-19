package org.example.courzelo.dto.requests.course;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssessmentRequest {
    private String oldName;
    private String name;
    private float weight;
}
