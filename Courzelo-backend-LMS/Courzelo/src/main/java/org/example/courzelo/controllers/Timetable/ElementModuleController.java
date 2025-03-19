package org.example.courzelo.controllers.Timetable;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.Timetable.ElementModuleDTO;
import org.example.courzelo.dto.responses.ClassRoomResponse;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.models.User;
import org.example.courzelo.repositories.Timetable.ElementModuleRepo;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.serviceImpls.ClassRoomServiceImpl;
import org.example.courzelo.serviceImpls.GroupServiceImpl;
import org.example.courzelo.serviceImpls.UserServiceImpl;
import org.example.courzelo.services.Timetable.ElementModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elementModules")
@AllArgsConstructor
@PreAuthorize("permitAll()")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class ElementModuleController {
    private final ElementModuleService elementModuleService;
    private final ElementModuleRepo elementModuleRepo;
    private final UserRepository userRepository;
    private final ClassRoomServiceImpl courseService;
    private final GroupServiceImpl groupService;
    private final UserServiceImpl userService;

    @GetMapping("/courses")
    public ResponseEntity<List<ClassRoomResponse>> getCourses() {
        List<ClassRoomResponse> courses = elementModuleService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<User>> getTeachers() {
        List<User> teachers = elementModuleService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/groups")
    public ResponseEntity<List<GroupResponse>> getGroups() {
        List<GroupResponse> groups = elementModuleService.getAllGroups();
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/create")
    public ResponseEntity<ElementModuleDTO> createElementModule(@RequestBody ElementModuleDTO elementModuleDTO) {
        ElementModuleDTO createdElementModule = elementModuleService.createElementModule(elementModuleDTO);
        return ResponseEntity.ok(createdElementModule);
    }
}
