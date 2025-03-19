package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.dto.responses.course.CourseResponse;

import java.util.List;

@Data
@Builder
public class ModuleGradesResponse {
    private CourseResponse course;
    private List<GradeResponse> grades;
}
