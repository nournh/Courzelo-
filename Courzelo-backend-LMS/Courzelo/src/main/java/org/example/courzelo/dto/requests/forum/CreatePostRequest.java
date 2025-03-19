package org.example.courzelo.dto.requests.forum;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CreatePostRequest {
    private String title;
    private String content;
    private String description;

    private String threadID;
}
