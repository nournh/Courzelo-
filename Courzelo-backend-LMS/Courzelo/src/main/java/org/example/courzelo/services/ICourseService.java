package org.example.courzelo.services;

import org.example.courzelo.dto.requests.course.AssessmentRequest;
import org.example.courzelo.dto.requests.course.CourseRequest;
import org.example.courzelo.dto.responses.course.CourseResponse;
import org.example.courzelo.dto.responses.course.PaginatedCoursesResponse;
import org.example.courzelo.models.institution.Module;
import org.example.courzelo.models.institution.Program;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


public interface ICourseService {
    ResponseEntity<HttpStatus> createCourse(CourseRequest courseRequest);
    ResponseEntity<HttpStatus> updateCourse(String id, CourseRequest courseRequest);
    ResponseEntity<HttpStatus> deleteCourse(String id);
    ResponseEntity<PaginatedCoursesResponse> getCoursesByProgram(int page, int size, String moduleID, String keyword);
    ResponseEntity<CourseResponse> getCourseById(String id);
    void deleteAllProgramCourses(String programID);
    void addCourseToModule(Module module, String courseID);
    void removeCourseFromModule(Module module, String courseID);
    void addModuleToCourse(String moduleID, String courseID);
    void removeModuleFromCourse(String moduleID, String courseID);

    ResponseEntity<HttpStatus> createAssessment(String id,AssessmentRequest assessmentRequest);

    ResponseEntity<HttpStatus> deleteAssessment(String id, String assessmentName);

    ResponseEntity<HttpStatus> updateAssessment(String id, AssessmentRequest assessmentRequest);
}

