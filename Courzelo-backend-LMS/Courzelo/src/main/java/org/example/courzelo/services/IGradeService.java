package org.example.courzelo.services;

import org.example.courzelo.dto.requests.GradeRequest;
import org.example.courzelo.dto.responses.GradeResponse;
import org.example.courzelo.dto.responses.MyGradesResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;

public interface IGradeService {
    ResponseEntity<HttpStatus> createGrade(GradeRequest gradeRequest);
    ResponseEntity<HttpStatus> updateGrade(String gradeID, GradeRequest gradeRequest);
    ResponseEntity<HttpStatus> deleteGrade(String gradeID);
    ResponseEntity<List<GradeResponse>> getGradesByGroup(String groupID);

    ResponseEntity<List<GradeResponse>> getGradesByGroupAndCourse(String groupID, String courseID);

    ResponseEntity<HttpStatus> createGrades(List<GradeRequest> gradeRequests);

    ResponseEntity<HttpStatus> updateGradeValidity(String gradeID);

    ResponseEntity<MyGradesResponse> getMyGradesByGroup(Principal principal);
}
