package org.example.courzelo.dto.responses.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaginatedCoursesResponse {
    private List<CourseResponse> courses;
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int itemsPerPage;
}
