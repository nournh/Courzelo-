package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@Document(collection = "programs")
public class Program {
    @Id
    private String id;
    private String name;
    private String description;
    private Integer credits;
    private String duration;
    private String institutionID;
    private byte[] excelFile;
    private List<String> courses;
    private List<String> modules;
    private List<String> groups;
}
