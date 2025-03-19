package org.example.courzelo.models.Forum;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "posts")
@Data
@Builder
 public class Post {

    @Id
    private String id;

    private String title;
    private String content;
    private String description;
    private String userEmail;
   @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDate;

    private String threadID;
    private List<String> commentsID;
}
