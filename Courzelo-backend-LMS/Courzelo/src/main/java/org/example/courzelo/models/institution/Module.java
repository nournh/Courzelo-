package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Builder
@Document(collection = "modules")
@Data
public class Module {
    @Id
    private String id;
    private String name;
    private String description;
    private String institutionID;
    private String programID;
    private List<String> coursesID;
}
