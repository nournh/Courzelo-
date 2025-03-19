package org.example.courzelo.dto.responses.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.courzelo.models.institution.Assessment;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private String id;
    private String name;
    private String semester;
    private String description;
    private Double scoreToPass;
    private List<String> skills;
    private String duration;
    private Boolean isFinished;
    private int credit;
    private List<Assessment> assessments;
    private String institutionID;
    private String program;
    private String moduleID;
    private Map<String,Long> courseParts;
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CourseResponse that = (CourseResponse) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
