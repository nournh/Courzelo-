package org.example.courzelo.exceptions;

import org.example.courzelo.serviceImpls.Forum.CommentNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNoSuchElementException(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(InstitutionNotFoundException.class)
    public ResponseEntity<String> handleInstitutionNotFoundException(InstitutionNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(ClassRoomNotFoundException.class)
    public ResponseEntity<String> handleCourseNotFoundException(ClassRoomNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(InvitationNotFoundException.class)
    public ResponseEntity<String> handleInvitationNotFoundException(InvitationNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(GroupNotFoundException.class)
    public ResponseEntity<String> handleGroupNotFoundException(GroupNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(ProgramHasNoCalendarException.class)
    public ResponseEntity<String> handleProgramHasNoCalendarException(ProgramHasNoCalendarException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(UserNotPartOfInstitutionException.class)
    public ResponseEntity<String> handleUserNotPartOfInstitutionException(UserNotPartOfInstitutionException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(UserAlreadyHasRoleException.class)
    public ResponseEntity<String> handleUserAlreadyHasRoleException(UserAlreadyHasRoleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(CalendarGenerationException.class)
    public ResponseEntity<String> handleCalendarGenerationException(CalendarGenerationException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
    @ExceptionHandler(UserAlreadyPartOfInstitutionException.class)
    public ResponseEntity<String> handleUserAlreadyPartOfInstitutionException(UserAlreadyPartOfInstitutionException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(TeacherAlreadyAssignedException.class)
    public ResponseEntity<String> handleTeacherAlreadyAssignedException(TeacherAlreadyAssignedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(RequestNotValidException.class)
    public ResponseEntity<String> handleRequestNotValidException(RequestNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(NotAllowedException.class)
    public ResponseEntity<String> handleNotAllowedException(NotAllowedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }
    @ExceptionHandler(ProgramAlreadyExistsException.class)
    public ResponseEntity<String> handleProgramAlreadyExistsException(ProgramAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(ProgramNotFoundException.class)
    public ResponseEntity<String> handleProgramNotFoundException(ProgramNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<String> handleModuleNotFoundException(CourseNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(CourseAlreadyExistsException.class)
    public ResponseEntity<String> handleModuleAlreadyExistsException(CourseAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(UserNotInGroupException.class)
    public ResponseEntity<String> handleUserNotInGroupException(UserNotInGroupException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(SemesterMustBeInOrderException.class)
    public ResponseEntity<String> handleSemesterMustBeInOrderException(SemesterMustBeInOrderException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(ClassRoomAlreadyCreatedException.class)
    public ResponseEntity<String> handleCourseAlreadyCreatedException(ClassRoomAlreadyCreatedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(CourseSemesterNotSetException.class)
    public ResponseEntity<String> handleModuleSemesterNotSetException(CourseSemesterNotSetException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(AssessmentAlreadyExistsException.class)
    public ResponseEntity<String> handleAssessmentAlreadyExistsException(AssessmentAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(AssessmentSumExceedsOneException.class)
    public ResponseEntity<String> handleAssessmentSumExceedsOneException(AssessmentSumExceedsOneException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(AssessmentNotFoundException.class)
    public ResponseEntity<String> handleAssessmentNotFoundException(AssessmentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(GradeNotFoundException.class)
    public ResponseEntity<String> handleGradeNotFoundException(GradeNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(NoTimeslotAvailableException.class)
    public ResponseEntity<String> handleNoTimeslotAvailableException(NoTimeslotAvailableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
    @ExceptionHandler(ForumThreadNotFoundException.class)
    public ResponseEntity<String> handleForumThreadNotFoundException(ForumThreadNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<String> handlePostNotFoundException(PostNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(CommentNotFoundException.class)
    public ResponseEntity<String> handleCommentNotFoundException(CommentNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(ModuleAlreadyExistsException.class)
    public ResponseEntity<String> handleModuleAlreadyExistsException(ModuleAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
    @ExceptionHandler(ModuleNotFoundException.class)
    public ResponseEntity<String> handleModuleNotFoundException(ModuleNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @ExceptionHandler(ClassroomBadRequestException.class)
    public ResponseEntity<String> handleClassroomBadRequestException(ClassroomBadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
