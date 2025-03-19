package org.example.courzelo.controllers;

import org.example.courzelo.dto.QuizDTO;
import org.example.courzelo.dto.requests.StudentQuizAnswers;
import org.example.courzelo.exceptions.ResourceNotFoundException;
import org.example.courzelo.models.Quiz;
import org.example.courzelo.models.QuizSubmission;
import org.example.courzelo.models.QuizSubmissionResult;
import org.example.courzelo.models.StudentSubmission;
import org.example.courzelo.security.CustomAuthorization;
import org.example.courzelo.services.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:4200/", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
@PreAuthorize("isAuthenticated()")
public class QuizController {
    private final QuizService quizService;
    private final CustomAuthorization customAuthorization;

    @Autowired
    public QuizController(QuizService quizService, CustomAuthorization customAuthorization) {
        this.quizService = quizService;
        this.customAuthorization = customAuthorization;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuizDTO>> getAllQuizzes() {
        List<QuizDTO> quizzes = quizService.getAllQuizzes();
        return ResponseEntity.ok(quizzes);
    }

    @DeleteMapping("/{id}/{quizID}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')&&@customAuthorization.canAccessClassroom(#quizID)")
    public ResponseEntity<QuizDTO> deleteQuiz(@PathVariable String id, @PathVariable String quizID) {
        try {
            quizService.deleteQuiz(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/duration/{quizId}")
    @PreAuthorize("isAuthenticated()")
    public int getQuizDuration(@PathVariable String quizId) {
        return quizService.getQuizDuration(quizId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable String id) {
        QuizDTO quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/{quizId}/submit")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessQuiz(#quizId)")
    public ResponseEntity<HttpStatus> submitQuiz(@PathVariable String quizId,Principal principal,@RequestBody StudentQuizAnswers studentQuizAnswers) {
        return  quizService.submitQuiz(quizId,principal.getName(),studentQuizAnswers);
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<QuizDTO> createQuizWithQuestions(@RequestBody QuizDTO quizDTO, Principal principal) {
        QuizDTO createdQuiz = quizService.createQuizWithQuestions(quizDTO,principal.getName());
        return ResponseEntity.ok(createdQuiz);
    }
    @GetMapping("/status/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizDTO> getQuizStatus(@PathVariable String id) {
        QuizDTO quiz = quizService.getQuizStatus(id);
        return ResponseEntity.ok(quiz);
    }



}
