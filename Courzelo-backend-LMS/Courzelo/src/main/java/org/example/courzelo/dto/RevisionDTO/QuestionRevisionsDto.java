package org.example.courzelo.dto.RevisionDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionRevisionsDto {

    private String id;

    private String text;

    private String correctAnswer;

    private String userAnswerText;

    private Boolean isCorrect;

    private List<AnswerRevisionDTO> answers;

    private QuizRevisionDTO quizRevision;
}


