package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@Document(collection = "classrooms")
public class ClassRoom {
    @Id
    private String id;
    private String course;
    private String teacher;
    private String group;
    private List<ClassRoomPost> posts;
    private String institutionID;
    private List<String> quizzes;
}
