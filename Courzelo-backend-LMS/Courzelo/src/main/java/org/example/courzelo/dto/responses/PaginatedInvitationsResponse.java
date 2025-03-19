package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PaginatedInvitationsResponse {
    private List<InvitationResponse> invitations;
    private int currentPage;
    private int totalPages;
    private long totalItems;
    private int itemsPerPage;
}
