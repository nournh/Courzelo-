package org.example.courzelo.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentSubmission {
    private String studentId;
    private int score;
    private boolean completed;
}
