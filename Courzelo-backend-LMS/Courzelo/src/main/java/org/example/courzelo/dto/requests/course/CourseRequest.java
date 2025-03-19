package org.example.courzelo.dto.requests.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseRequest {
    private String name;
    private String description;
    private String duration;
    private String semester;
    private Double scoreToPass;
    private Boolean isFinished;
    private List<String> skills;
    private int credit;
    private String program;
    private String moduleID;
    private Map<String,Long> courseParts;

}
