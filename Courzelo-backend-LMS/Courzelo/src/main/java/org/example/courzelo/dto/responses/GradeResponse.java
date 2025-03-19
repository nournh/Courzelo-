package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GradeResponse {
    private String id;
    private String name;
    private String courseID;
    private String courseName;
    private Double scoreToPass;
    private String institutionID;
    private boolean valid;
    private String groupID;
    private String studentEmail;
    private double grade;
}
