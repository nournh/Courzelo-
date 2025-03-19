package org.example.courzelo.models.institution;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@Document(collection = "grades")
public class Grade {
    @Id
    private String id;
    private String name;
    private String courseID;
    private String institutionID;
    private String groupID;
    private String studentEmail;
    private Double grade;
    private boolean valid;
}
