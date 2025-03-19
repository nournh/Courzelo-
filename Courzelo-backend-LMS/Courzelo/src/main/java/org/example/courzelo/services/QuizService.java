package org.example.courzelo.services;

import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.QuestionDTO;
import org.example.courzelo.dto.QuizDTO;
import org.example.courzelo.dto.requests.StudentQuizAnswers;
import org.example.courzelo.models.*;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionService questionService;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(QuizService.class);


    @Autowired
    public QuizService(QuizRepository quizRepository, QuestionRepository questionRepository, AnswerRepository answerRepository, QuestionService questionService, ClassRoomRepository classRoomRepository, UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.questionService = questionService;
        this.classRoomRepository = classRoomRepository;
        this.userRepository = userRepository;
    }

    public List<QuizDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteQuiz(String id) {
       Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Quiz not found"));
         if(quiz.getCourse() != null) {
                removeQuizFromCourse(quiz);
         }
        quizRepository.deleteById(id);
    }

    public QuizDTO getQuizById(String id) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
        return mapToDTO(quiz);
    }
    public int getQuizDuration(String quizId) {
        Optional<Quiz> quizOptional = quizRepository.findById(quizId);
        return quizOptional.map(Quiz::getDuration).orElse(0);
    }

    public ResponseEntity<HttpStatus> submitQuiz(String quizId, String studentEmail, StudentQuizAnswers studentQuizAnswers) {
       User user = userRepository.findByEmail(studentEmail).orElseThrow(() -> new NoSuchElementException("User not found"));
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new NoSuchElementException("Quiz not found"));
        log.info("studentQuizAnswers: {}", studentQuizAnswers);
        log.info("Quiz: {}", quiz);
        if(quiz.getStudentSubmissions()==null) {
            log.info("Student submissions is null");
            quiz.setStudentSubmissions(new ArrayList<>());
        }
        if(quiz.getStudentSubmissions().stream().anyMatch(studentSubmission -> studentSubmission.getStudentId().equals(user.getEmail()))) {
            throw new RuntimeException("Quiz already submitted");
        }
        int score = 0;
        log.info("Quiz: {}", quiz);
        for (Question question : studentQuizAnswers.getQuestions()) {
            Question quizQuestion = quiz.getQuestions().stream()
                    .filter(q -> q.getId().equals(question.getId()))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchElementException("Question not found"));
            if (question.getAnswer().equals(quizQuestion.getCorrectAnswer())) {
                score += quizQuestion.getPoints();
            }
        }
        StudentSubmission studentSubmission = StudentSubmission.builder()
                .studentId(user.getEmail())
                .score(score)
                .completed(true)
                .build();
        quiz.getStudentSubmissions().add(studentSubmission);
        quizRepository.save(quiz);
        log.info("Quiz after save: {}", quiz);
        return ResponseEntity.ok().build();
    }

    public QuizDTO createQuizWithQuestions(QuizDTO quizDTO,String email) {
        Quiz quiz = mapToEntity(quizDTO, new Quiz());
        quiz.setUser(email);
        if(quizDTO.getCourse() != null) {
            quiz.setCourse(quizDTO.getCourse());
        }
        quiz.setCreatedAt(LocalDateTime.now());
        quiz = quizRepository.save(quiz);
        addQuizToCourse(quiz, quizDTO.getCourse());
        final String quizId = quiz.getId();
        List<Question> questions = quizDTO.getQuestions().stream()
                .map(questionDTO -> {
                    Question question = mapToQuestionEntity(questionDTO);
                    question.setQuizID(quizId);
                    question = questionRepository.save(question);
                    logger.info("Question ID after save: {}", question.getId());
                    return question;
                })
                .collect(Collectors.toList());
        quiz.setQuestions(questions);
        quiz = quizRepository.save(quiz);
        return mapToDTO(quiz);
    }
    public void addQuizToCourse(Quiz quiz, String courseId) {
        ClassRoom classRoom = classRoomRepository.findById(courseId).orElseThrow(() -> new NoSuchElementException("Course not found"));
        if(classRoom.getQuizzes() == null) {
            log.info("Course quizzes is null");
            classRoom.setQuizzes(List.of(quiz.getId()));
        } else {
            log.info("Course quizzes is not null");
            log.info("QUIZ ID: {}", quiz.getId());
            classRoom.getQuizzes().add(quiz.getId());
        }
        classRoomRepository.save(classRoom);
    }
    public void removeQuizFromCourse(Quiz quiz) {
        ClassRoom classRoom = classRoomRepository.findById(quiz.getCourse()).orElseThrow(() -> new NoSuchElementException("Course not found"));
        classRoom.getQuizzes().remove(quiz.getId());
        classRoomRepository.save(classRoom);
    }


    public QuizDTO mapToDTO(final Quiz quiz) {
        QuizDTO quizDTO = new QuizDTO();
        return mapToDTO(quiz, quizDTO);
    }

    private QuizDTO mapToDTO(final Quiz quiz, final QuizDTO quizDTO) {
        if (quiz.getId() != null) {
            quizDTO.setId(quiz.getId());
        }
        quizDTO.setUserEmail(quiz.getUser());
        quizDTO.setTitle(quiz.getTitle());
        quizDTO.setDescription(quiz.getDescription());
        quizDTO.setQuestions(quiz.getQuestions().stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList()));
        quizDTO.setDuration(quiz.getDuration());
        quizDTO.setCourse(quiz.getCourse() != null ? quiz.getCourse() : null);
        quizDTO.setCreatedAt(quiz.getCreatedAt());
        quizDTO.setStudentSubmissions(quiz.getStudentSubmissions());
        return quizDTO;
    }
    public Quiz mapToEntity(final QuizDTO quizDTO, final Quiz quiz) {
       log.info("QuizDTO: {}", quizDTO);
       // quiz.setId(quizDTO.getId());
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setQuestions(quizDTO.getQuestions().stream()
                .map(this::mapToQuestionEntity)
                .collect(Collectors.toList()));
        quiz.setDuration(quizDTO.getDuration());
        quiz.setCourse(quizDTO.getCourse()!= null ? quizDTO.getCourse() : null);
        quiz.setCreatedAt(quizDTO.getCreatedAt());
        log.info("Quiz: {}", quiz);
        return quiz;
    }
    public QuizDTO getQuizStatus(String id) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found"));
        return mapToDTO(quiz);
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        QuestionDTO questionDTO = new QuestionDTO();
        if(question.getId() != null) {
            questionDTO.setId(question.getId());
        }
        questionDTO.setText(question.getText());
        questionDTO.setOptions(question.getOptions());
        questionDTO.setCorrectAnswer(question.getCorrectAnswer());
        questionDTO.setType(question.getType());
        questionDTO.setPoints(question.getPoints());
        return questionDTO;
    }

    private Question mapToQuestionEntity(QuestionDTO questionDTO) {
        Question question = new Question();
        question.setText(questionDTO.getText());
        question.setOptions(questionDTO.getOptions());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setType(questionDTO.getType());
        question.setPoints(questionDTO.getPoints());
        return question;
    }
}
