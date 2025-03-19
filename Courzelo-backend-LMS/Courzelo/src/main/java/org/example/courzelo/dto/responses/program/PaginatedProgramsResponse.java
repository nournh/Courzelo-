package org.example.courzelo.dto.responses.program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaginatedProgramsResponse {
    private List<ProgramResponse> programs;
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int itemsPerPage;
}
