package org.example.courzelo.dto.requests.forum;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PaginatedPostsResponse {
    private int page;
    private int totalPages;
    private long totalPosts;
    private int postsPerPage;
    private List<PostResponse> posts;
}
