package org.example.courzelo.controllers.institution;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.GradeRequest;
import org.example.courzelo.dto.responses.GradeResponse;
import org.example.courzelo.dto.responses.MyGradesResponse;
import org.example.courzelo.services.IGradeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/grade")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class GradeController {
    private final IGradeService iGradeService;
    @GetMapping("/{groupID}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<List<GradeResponse>> getGrades(@PathVariable String groupID) {
        return iGradeService.getGradesByGroup(groupID);
    }
    @GetMapping("/{groupID}/{courseID}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<List<GradeResponse>> getGrades(@PathVariable String groupID,@PathVariable String courseID) {
        return iGradeService.getGradesByGroupAndCourse(groupID,courseID);
    }
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MyGradesResponse> getMyGradesByGroup(Principal principal) {
        return iGradeService.getMyGradesByGroup(principal);
    }
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> addGrade(@RequestBody GradeRequest gradeRequest) {
        return iGradeService.createGrade(gradeRequest);
    }
    @PostMapping("/add-grades")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> addGrades(@RequestBody List<GradeRequest> gradeRequests) {
        return iGradeService.createGrades(gradeRequests);
    }
    @PutMapping("/{gradeID}/update")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessGrade(#gradeID)")
    public ResponseEntity<HttpStatus> updateGrade(@PathVariable String gradeID,@RequestBody GradeRequest gradeRequest) {
        return iGradeService.updateGrade(gradeID,gradeRequest);
    }
    @DeleteMapping("/{gradeID}/delete")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessGrade(#gradeID)")
    public ResponseEntity<HttpStatus> deleteGrade(@PathVariable String gradeID) {
        return iGradeService.deleteGrade(gradeID);
    }
    @PutMapping("/{gradeID}/update-validity")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')&&@customAuthorization.canAccessGrade(#gradeID)")
    public ResponseEntity<HttpStatus> updateGradeValidity(@PathVariable String gradeID) {
        return iGradeService.updateGradeValidity(gradeID);
    }
}
