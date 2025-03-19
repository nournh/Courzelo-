package org.example.courzelo.controllers.institution;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.ClassRoomPostRequest;
import org.example.courzelo.dto.requests.ClassRoomRequest;
import org.example.courzelo.dto.responses.ClassRoomResponse;
import org.example.courzelo.models.institution.Semester;
import org.example.courzelo.security.CustomAuthorization;
import org.example.courzelo.services.IClassRoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classroom")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class ClassroomController {
    private final IClassRoomService iClassRoomService;
    private final CustomAuthorization customAuthorization;
    @PostMapping("/{institutionID}/add")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canCreateClassRoom(#institutionID)")
    public ResponseEntity<HttpStatus> addClassroom(@PathVariable String institutionID, @RequestBody ClassRoomRequest classRoomRequest, Principal principal) {
        return iClassRoomService.createClassRoom(institutionID, classRoomRequest,principal);
    }
    @PostMapping("/{institutionID}/{programID}/add")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canCreateClassRoom(#institutionID)")
    public ResponseEntity<HttpStatus> addProgramClassrooms(@PathVariable String institutionID, @PathVariable String programID, @RequestParam(required = false) Semester semester, Principal principal) {
        return iClassRoomService.createProgramClassRooms(institutionID,programID,semester,principal);
    }
    @PutMapping("/{classroomID}/update")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<HttpStatus> updateClassroom(@PathVariable String classroomID, @RequestBody ClassRoomRequest classRoomRequest) {
        return iClassRoomService.updateClassRoom(classroomID, classRoomRequest);
    }
    @DeleteMapping("/{classroomID}/delete")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<HttpStatus> deleteClassroom(@PathVariable String classroomID) {
        return iClassRoomService.deleteClassRoom(classroomID);
    }
    @GetMapping("/{classroomID}")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<ClassRoomResponse> getClassroom(@PathVariable String classroomID) {
        return iClassRoomService.getClassRoom(classroomID);
    }
    @PutMapping("/{classroomID}/setTeacher")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<HttpStatus> setTeacher(@PathVariable String classroomID,@RequestParam String email) {
        return iClassRoomService.setTeacher(classroomID,email);
    }
    @PutMapping("/{classroomID}/addPost")
    @PreAuthorize("hasRole('TEACHER')&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<HttpStatus> addPost(
            @PathVariable String classroomID,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart("files") MultipartFile[] files) {
        ClassRoomPostRequest classRoomPostRequest = ClassRoomPostRequest.builder().title(title).description(description).build();
        return iClassRoomService.addPost(classroomID, classRoomPostRequest, files);
    }
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessClassroom(#classroomID)")
    @GetMapping("/{classroomID}/{fileName:.+}/download")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable @NotNull String classroomID,@PathVariable @NotNull String fileName) {
        return iClassRoomService.downloadFile(classroomID,fileName);
    }
    @DeleteMapping("/{classroomID}/deletePost")
    @PreAuthorize("hasRole('TEACHER')&&@customAuthorization.canAccessClassroom(#classroomID)")
    public ResponseEntity<HttpStatus> deletePost(@PathVariable String classroomID,@RequestParam String postID) {
        return iClassRoomService.deletePost(classroomID,postID);
    }
    @GetMapping("/myClassrooms")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClassRoomResponse>> getMyClassrooms(Principal principal) {
        return iClassRoomService.getMyClassRooms(principal);
    }
}
