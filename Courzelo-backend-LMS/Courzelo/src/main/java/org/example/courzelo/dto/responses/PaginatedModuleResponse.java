package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.util.List;
@Builder
@Data
public class PaginatedModuleResponse {
    private List<ModuleResponse> modules;
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int itemsPerPage;

}
