package org.example.courzelo.models.institution;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Builder
@Document(collection = "courses")
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    private String id;
    private String name;
    private String description;
    private String duration;
    private Boolean isFinished;
    private Double ScoreToPass;
    private List<String> skills;
    private Semester semester;
    private int credit;
    private List<Assessment> assessments;
    private String institutionID;
    private String program;
    private String moduleID;
    private Map<String,Long> courseParts;
    public Course(String id, String name, String description, String duration, Boolean isFinished, Double ScoreToPass, List<String> skills, Semester semester, int credit, List<Assessment> assessments, String institutionID, String program, Map<String, Long> courseParts) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.isFinished = isFinished != null ? isFinished : false;
        this.ScoreToPass = ScoreToPass;
        this.skills = skills;
        this.semester = semester;
        this.credit = credit;
        this.assessments = assessments;
        this.institutionID = institutionID;
        this.program = program;
        this.courseParts = courseParts;
    }

}

