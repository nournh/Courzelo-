package org.example.courzelo.dto.requests.forum;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PaginatedCommentsResponse {
    private int page;
    private int totalPages;
    private long totalComments;
    private int commentsPerPage;
    private List<CommentResponse> comments;
}
