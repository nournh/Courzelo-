package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.GradeRequest;
import org.example.courzelo.dto.responses.GradeResponse;
import org.example.courzelo.dto.responses.ModuleGradesResponse;
import org.example.courzelo.dto.responses.MyGradesResponse;
import org.example.courzelo.dto.responses.course.CourseResponse;
import org.example.courzelo.exceptions.GradeNotFoundException;
import org.example.courzelo.exceptions.CourseNotFoundException;
import org.example.courzelo.exceptions.UserNotFoundException;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Course;
import org.example.courzelo.models.institution.Grade;
import org.example.courzelo.repositories.GradeRepository;
import org.example.courzelo.repositories.CourseRepository;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.services.IGradeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
@Slf4j
public class GradeServiceImpl implements IGradeService {
    private final GradeRepository gradeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Override
    public ResponseEntity<HttpStatus> createGrade(GradeRequest gradeRequest) {
        Grade existingGrade = gradeRepository.findByNameAndCourseIDAndStudentEmail(
                        gradeRequest.getName(), gradeRequest.getCourseID(), gradeRequest.getStudentEmail())
                .orElse(null);

        if (existingGrade != null) {
            existingGrade.setGrade(gradeRequest.getGrade());
            gradeRepository.save(existingGrade);
        } else {
            User user = userRepository.findByEmail(gradeRequest.getStudentEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            Grade newGrade = Grade.builder()
                    .name(gradeRequest.getName())
                    .courseID(gradeRequest.getCourseID())
                    .groupID(gradeRequest.getGroupID())
                    .institutionID(user.getEducation().getInstitutionID())
                    .studentEmail(gradeRequest.getStudentEmail())
                    .grade(gradeRequest.getGrade())
                    .valid(true)
                    .build();

            gradeRepository.save(newGrade);

            if (user.getEducation().getGrades() == null) {
                user.getEducation().setGrades(new ArrayList<>());
            }
            user.getEducation().getGrades().add(newGrade.getId());
            userRepository.save(user);

            log.info("Grade created: {}", newGrade);
        }

        return ResponseEntity.ok(HttpStatus.CREATED);
    }
    @Override
    public ResponseEntity<HttpStatus> createGrades(List<GradeRequest> gradeRequests) {
        gradeRequests.forEach(this::createGrade);
        return ResponseEntity.ok(HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<HttpStatus> updateGradeValidity(String gradeID) {
        Grade grade = gradeRepository.findById(gradeID).orElseThrow(() -> new GradeNotFoundException("Grade not found"));
        grade.setValid(!grade.isValid());
        gradeRepository.save(grade);
        log.info("Grade validity updated: {}", grade);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<MyGradesResponse> getMyGradesByGroup(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        List<Grade> grades = gradeRepository.findByStudentEmailAndGroupID(principal.getName(), user.getEducation().getGroupID())
                .orElseThrow(() -> new GradeNotFoundException("Grades not found"));
        List<GradeResponse> gradeResponses = new ArrayList<>();
        grades.forEach(grade -> gradeResponses.add(GradeResponse.builder()
                .id(grade.getId())
                .name(grade.getName())
                .courseID(grade.getCourseID())
                .groupID(grade.getGroupID())
                .institutionID(grade.getInstitutionID())
                .studentEmail(grade.getStudentEmail())
                .grade(grade.getGrade())
                .valid(grade.isValid())
                .build()));

        Map<CourseResponse, List<GradeResponse>> moduleGradesMap = new HashMap<>();
        gradeResponses.forEach(gradeResponse -> {
            Course course = courseRepository.findById(gradeResponse.getCourseID())
                    .orElseThrow(() -> new CourseNotFoundException("Module not found"));
            CourseResponse courseResponse = CourseResponse.builder()
                    .id(course.getId())
                    .name(course.getName())
                    .scoreToPass(course.getScoreToPass())
                    .credit(course.getCredit())
                    .semester(String.valueOf(course.getSemester()))
                    .duration(course.getDuration())
                    .assessments(course.getAssessments())
                    .build();
            moduleGradesMap.computeIfAbsent(courseResponse, k -> new ArrayList<>()).add(gradeResponse);
        });

        List<ModuleGradesResponse> moduleGradesResponses = new ArrayList<>();
        moduleGradesMap.forEach((course, gradesList) -> {
            ModuleGradesResponse moduleGradesResponse = ModuleGradesResponse.builder()
                    .course(course)
                    .grades(gradesList)
                    .build();
            moduleGradesResponses.add(moduleGradesResponse);
        });
        MyGradesResponse myGradesResponse = MyGradesResponse.builder()
                .grades(moduleGradesResponses)
                .build();

        return ResponseEntity.ok(myGradesResponse);
    }

    @Override
    public ResponseEntity<HttpStatus> updateGrade(String gradeID, GradeRequest gradeRequest) {
       Grade grade = gradeRepository.findById(gradeID).orElseThrow(() -> new GradeNotFoundException("Grade not found"));
         grade.setName(gradeRequest.getName());
            grade.setCourseID(gradeRequest.getCourseID());
            grade.setGroupID(gradeRequest.getGroupID());
            grade.setStudentEmail(gradeRequest.getStudentEmail());
            grade.setGrade(gradeRequest.getGrade());
            gradeRepository.save(grade);
            log.info("Grade updated: {}", grade);
            return ResponseEntity.ok(HttpStatus.OK);

    }

    @Override
    public ResponseEntity<HttpStatus> deleteGrade(String gradeID) {
        Grade grade = gradeRepository.findById(gradeID).orElseThrow(() -> new GradeNotFoundException("Grade not found"));
        gradeRepository.delete(grade);
        log.info("Grade deleted: {}", grade);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<List<GradeResponse>> getGradesByGroup(String groupID) {
        List<Grade> grades = gradeRepository.findAllByGroupID(groupID).orElseThrow(() -> new GradeNotFoundException("Grades not found"));
        List<GradeResponse> gradeResponses = new ArrayList<>();
        log.info("Grades found: {}", grades);
        grades.forEach(grade -> gradeResponses.add(GradeResponse.builder()
                .id(grade.getId())
                .name(grade.getName())
                .courseID(grade.getCourseID())
                .groupID(grade.getGroupID())
                .institutionID(grade.getInstitutionID())
                .studentEmail(grade.getStudentEmail())
                .grade(grade.getGrade())
                .valid(grade.isValid())
                .build()));
        log.info("Grades found: {}", gradeResponses);
        return ResponseEntity.ok(gradeResponses);
    }

    @Override
    public ResponseEntity<List<GradeResponse>> getGradesByGroupAndCourse(String groupID, String courseID) {
        List<Grade> grades = gradeRepository.findAllByGroupIDAndCourseID(groupID, courseID).orElseThrow(() -> new GradeNotFoundException("Grades not found"));
        List<GradeResponse> gradeResponses = new ArrayList<>();
        log.info("Grades found: {}", grades);
        grades.forEach(grade -> gradeResponses.add(GradeResponse.builder()
                .id(grade.getId())
                .name(grade.getName())
                .courseID(grade.getCourseID())
                .groupID(grade.getGroupID())
                .institutionID(grade.getInstitutionID())
                .studentEmail(grade.getStudentEmail())
                .grade(grade.getGrade())
                        .valid(grade.isValid())
                .build()));
        log.info("Grades found: {}", gradeResponses);
        return ResponseEntity.ok(gradeResponses);
    }


}
