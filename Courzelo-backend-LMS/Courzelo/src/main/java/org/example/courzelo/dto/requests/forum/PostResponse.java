package org.example.courzelo.dto.requests.forum;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {
    private String id;

    private String title;
    private String content;
    private String description;
    private String userEmail;
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;

    private String threadID;
    private int commentsSize;
}
