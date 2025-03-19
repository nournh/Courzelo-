package org.example.courzelo.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.example.courzelo.models.Question;
import org.example.courzelo.models.Status;
import org.example.courzelo.models.StudentSubmission;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;
import java.util.List;
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Data
public class QuizDTO {
    private String id;
    private String userEmail;
    private String title;
    private String description;
    private List<QuestionDTO> questions;
    private int duration;
    private String course;
    private LocalDateTime createdAt;
    private List<StudentSubmission> studentSubmissions;
}
