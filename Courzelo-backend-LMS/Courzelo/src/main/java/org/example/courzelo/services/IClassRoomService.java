package org.example.courzelo.services;

import org.example.courzelo.dto.requests.ClassRoomPostRequest;
import org.example.courzelo.dto.requests.ClassRoomRequest;
import org.example.courzelo.dto.responses.ClassRoomResponse;
import org.example.courzelo.models.institution.Semester;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

public interface IClassRoomService {
    ResponseEntity<HttpStatus> createClassRoom(String institutionID,ClassRoomRequest classroomRequest,Principal principal);
    ResponseEntity<HttpStatus> updateClassRoom(String classroomID,ClassRoomRequest classroomRequest);
    ResponseEntity<HttpStatus> deleteClassRoom(String classroomID);
    ResponseEntity<ClassRoomResponse> getClassRoom(String classroomID);
    ResponseEntity<HttpStatus> setTeacher(String classroomID, String email);
    ResponseEntity<HttpStatus> addPost(String classroomID, ClassRoomPostRequest classroomPostRequest, MultipartFile[] files);
    ResponseEntity<HttpStatus> deletePost(String classroomID, String postID);
    void removeTeacherFromClassRooms(String teacherEmail);
    ResponseEntity<byte[]> downloadFile(String classroomID, String fileName);

    ResponseEntity<List<ClassRoomResponse>> getMyClassRooms(Principal principal);

    ResponseEntity<HttpStatus> createProgramClassRooms(String institutionID, String programID, Semester semester, Principal principal);
}
