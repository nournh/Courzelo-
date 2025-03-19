package org.example.courzelo.models.Forum;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "threads")
@Data
@Builder
public class ForumThread {
    @Id
    private String id;
    private String name;
    private String description;
    private String institutionID;

    private List<String> posts;
}
