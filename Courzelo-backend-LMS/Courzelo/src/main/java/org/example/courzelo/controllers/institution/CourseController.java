package org.example.courzelo.controllers.institution;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.course.AssessmentRequest;
import org.example.courzelo.dto.requests.course.CourseRequest;
import org.example.courzelo.dto.responses.course.CourseResponse;
import org.example.courzelo.dto.responses.course.PaginatedCoursesResponse;
import org.example.courzelo.services.ICourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course")
@AllArgsConstructor
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class CourseController {
    private final ICourseService courseService;
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> createCourse(@RequestBody CourseRequest courseRequest){
        return courseService.createCourse(courseRequest);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> updateCourse(@PathVariable String id, @RequestBody CourseRequest courseRequest){
        return courseService.updateCourse(id, courseRequest);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> deleteCourse(@PathVariable String id){
        return courseService.deleteCourse(id);
    }
    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<PaginatedCoursesResponse> getCourses(@RequestParam int page, @RequestParam int sizePerPage,
                                                               @RequestParam(required = false) String keyword, @RequestParam String moduleID){
        return courseService.getCoursesByProgram(page, sizePerPage, moduleID, keyword);
    }
    @GetMapping("/{id}")
    @PreAuthorize("@customAuthorization.canAccessCourse(#id)")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable String id){
        return courseService.getCourseById(id);
    }
    @PostMapping("/{id}/create-assessment")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> createAssessment(@PathVariable String id,@RequestBody AssessmentRequest assessmentRequest){
        return courseService.createAssessment(id,assessmentRequest);
    }
    @DeleteMapping("/{id}/assessment/{assessmentName}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> deleteAssessment(@PathVariable String id, @PathVariable String assessmentName){
        return courseService.deleteAssessment(id,assessmentName);
    }
    @PutMapping("/{id}/update-assessment")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> updateAssessment(@PathVariable String id,@RequestBody AssessmentRequest assessmentRequest){
        return courseService.updateAssessment(id, assessmentRequest);
    }
}
