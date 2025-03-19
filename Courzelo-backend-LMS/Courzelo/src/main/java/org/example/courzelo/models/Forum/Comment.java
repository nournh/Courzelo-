package org.example.courzelo.models.Forum;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
@Builder
public class Comment {
    @Id
    private String id;
    private String postID;
    private String userEmail;
    private String content;
    private LocalDateTime createdAt;
}
