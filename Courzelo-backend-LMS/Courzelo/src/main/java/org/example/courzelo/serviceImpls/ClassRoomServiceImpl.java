package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.QuizDTO;
import org.example.courzelo.dto.requests.ClassRoomPostRequest;
import org.example.courzelo.dto.requests.ClassRoomRequest;
import org.example.courzelo.dto.responses.ClassRoomPostResponse;
import org.example.courzelo.dto.responses.ClassRoomResponse;
import org.example.courzelo.dto.responses.ModuleResponse;
import org.example.courzelo.exceptions.*;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.*;
import org.example.courzelo.models.institution.Course;
import org.example.courzelo.models.institution.Module;
import org.example.courzelo.repositories.*;
import org.example.courzelo.services.IClassRoomService;
import org.example.courzelo.services.QuizService;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
@Slf4j
public class ClassRoomServiceImpl implements IClassRoomService {
    private final ClassRoomRepository classRoomRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final QuizService quizService;
    private final ProgramRepository programRepository;
    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    @Override
    public ResponseEntity<HttpStatus> createClassRoom(String institutionID, ClassRoomRequest classRoomRequest, Principal principal) {
        log.info("Creating classroom");
        if(classRoomRequest.getGroup()==null || classRoomRequest.getCourse()==null){
            throw new ClassroomBadRequestException("Group and course must be set");
        }
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        ClassRoom classRoom = ClassRoom.builder()
                .course(classRoomRequest.getCourse())
                .institutionID(institution.getId())
                .teacher(classRoomRequest.getTeacher())
                .group(classRoomRequest.getGroup())
                .posts(new ArrayList<>())
                .build();
        classRoomRepository.save(classRoom);
        institution.getClassRoomsID().add(classRoom.getId());
        institutionRepository.save(institution);
        if(classRoomRequest.getTeacher()!=null){
            log.info("Adding classroom to teacher");
            if (institution.getTeachers().contains(classRoomRequest.getTeacher())) {
                User teacher = userRepository.findUserByEmail(classRoomRequest.getTeacher());
                teacher.getEducation().getClassroomsID().add(classRoom.getId());
                userRepository.save(teacher);
            }
        }
        if(classRoomRequest.getGroup()!=null){
            log.info("Adding classroom to group");
            Group group = groupRepository.findById(classRoomRequest.getGroup()).orElseThrow(() -> new GroupNotFoundException("Group not found"));
            group.getClassRooms().add(classRoom.getId());
            groupRepository.save(group);
            log.info("ClassRoom added to group");
        }
        log.info("ClassRoom created");
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> updateClassRoom(String classroomID, ClassRoomRequest classRoomRequest) {
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow();
        if (!classRoom.getTeacher().equals(classRoomRequest.getTeacher())) {
            Institution institution = institutionRepository.findById(classRoom.getInstitutionID()).orElseThrow();
            if (institution.getTeachers().contains(classRoomRequest.getTeacher())) {
                userRepository.findByEmail(classRoomRequest.getTeacher()).ifPresent(
                        teacher -> {
                            classRoom.setTeacher(classRoomRequest.getTeacher());
                            if (teacher.getEducation() != null && teacher.getEducation().getClassroomsID() != null && !teacher.getEducation().getClassroomsID().contains(classRoom.getId())) {
                                teacher.getEducation().getClassroomsID().add(classRoom.getId());
                                userRepository.save(teacher);
                            }
                        }
                );
            }
        }
        classRoomRepository.save(classRoom);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteClassRoom(String classroomID) {
        log.info("Deleting classroom with id: " + classroomID);
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow(() -> new ClassRoomNotFoundException("ClassRoom not found"));
        if (classRoom.getGroup() != null) {
            log.info("Deleting classroom from group");
            groupRepository.findById(classRoom.getGroup()).ifPresent(group -> {
                group.getClassRooms().remove(classRoom.getId());
                groupRepository.save(group);
            });
        }
        if(classRoom.getTeacher()!= null) {
            log.info("Deleting classroom from teacher");
             userRepository.findByEmail(classRoom.getTeacher()).ifPresent(teacher -> {
                 if (teacher.getEducation() != null && teacher.getEducation().getClassroomsID() != null && teacher.getEducation().getClassroomsID().contains(classRoom.getId())) {
                     teacher.getEducation().getClassroomsID().remove(classRoom.getId());
                     userRepository.save(teacher);
                 }
             });
        }
         institutionRepository.findById(classRoom.getInstitutionID()).ifPresent(
                institution -> {
                    if (institution.getClassRoomsID() != null && institution.getClassRoomsID().contains(classRoom.getId())) {
                        institution.getClassRoomsID().remove(classRoom.getId());
                        institutionRepository.save(institution);
                    }
                }
         );
        classRoomRepository.delete(classRoom);
        log.info("ClassRoom deleted");
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ClassRoomResponse> getClassRoom(String classroomID) {
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow(() -> new ClassRoomNotFoundException("ClassRoom not found"));
        List<QuizDTO> quizzes = new ArrayList<>();
        if(classRoom.getQuizzes()!= null){
            classRoom.getQuizzes().forEach(quizID -> {
                QuizDTO quiz = quizService.getQuizById(quizID);
                quizzes.add(quiz);
            });
            }
        return ResponseEntity.ok(ClassRoomResponse.builder()
                .id(classRoom.getId())
                .course(classRoom.getCourse())
                .teacher(classRoom.getTeacher() == null ? null : classRoom.getTeacher())
                .group(classRoom.getGroup())
                .posts(classRoom.getPosts() != null ? classRoom.getPosts().stream().map(classRoomPost -> ClassRoomPostResponse.builder()
                        .id(classRoomPost.getId())
                        .title(classRoomPost.getTitle())
                        .description(classRoomPost.getDescription())
                        .created(classRoomPost.getCreated())
                        .files(classRoomPost.getFiles() != null ? returnOnlyFileName(classRoomPost.getFiles()) : null)
                        .build()).toList() : List.of())
                        .institutionID(classRoom.getInstitutionID())
                        .quizzes(quizzes)
                .build());
    }

    @Override
    public ResponseEntity<HttpStatus> setTeacher(String classroomID, String email) {
        log.info("Setting teacher to classroom");
        log.info("ClassRoom ID: " + classroomID);
        log.info("Email: " + email);
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow(()-> new ClassRoomNotFoundException("ClassRoom not found"));
        Institution institution = institutionRepository.findById(classRoom.getInstitutionID()).orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        if(classRoom.getTeacher() != null && classRoom.getTeacher().equals(email)){
            throw new TeacherAlreadyAssignedException("Teacher already assigned to classroom");
        }
        if(institution.getTeachers()!=null&&institution.getTeachers().contains(email)){
            log.info("Teacher is part of institution");
            removeOldTeacher(classRoom);
            User teacher = userRepository.findUserByEmail(email);
            classRoom.setTeacher(teacher.getEmail());
            teacher.getEducation().getClassroomsID().add(classRoom.getId());
            userRepository.save(teacher);
            classRoomRepository.save(classRoom);
            return ResponseEntity.ok(HttpStatus.OK);
        }
        throw new UserNotPartOfInstitutionException(email+" is not a teacher in the institution");
    }
    private void removeOldTeacher(ClassRoom classRoom) {
        if (classRoom.getTeacher() != null) {
           userRepository.findByEmail(classRoom.getTeacher()).ifPresent(
                    teacher -> {
                        if (teacher.getEducation() != null && teacher.getEducation().getClassroomsID() != null && teacher.getEducation().getClassroomsID().contains(classRoom.getId())) {
                            teacher.getEducation().getClassroomsID().remove(classRoom.getId());
                            userRepository.save(teacher);
                        }
                    }
            );
        }
    }
    public List<String> returnOnlyFileName(List<String> files) {
        log.info("Returning only file name {}", files);
        return files.stream()
                .map(file -> file.replace("\\", "/"))
                .map(file -> file.substring(file.lastIndexOf('/') + 1))
                .toList();
    }

    @Override
    public ResponseEntity<HttpStatus> addPost(String classroomID, ClassRoomPostRequest classRoomPostRequest, MultipartFile[] files) {
        log.info("Adding post to classroom");
        log.info("ClassRoom ID: " + classroomID);
        log.info("Title: " + classRoomPostRequest.getTitle());
        log.info("Description: " + classRoomPostRequest.getDescription());
        log.info("Files: " + Arrays.toString(files));
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow(() -> new ClassRoomNotFoundException("ClassRoom not found"));
        Institution institution = institutionRepository.findById(classRoom.getInstitutionID()).orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        if(classRoom.getPosts()==null){
            classRoom.setPosts(new ArrayList<>());
        }
        classRoom.getPosts().add(ClassRoomPost.builder()
                .title(classRoomPostRequest.getTitle())
                .description(classRoomPostRequest.getDescription())
                .created(LocalDateTime.now())
                .files(uploadFiles(files, classRoom.getId(),institution))
                .build());
        log.info("Post added to classroom");
        classRoomRepository.save(classRoom);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deletePost(String classroomID, String postID) {
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow(() -> new ClassRoomNotFoundException("ClassRoom not found"));
        //delete files
        classRoom.getPosts().stream().filter(classRoomPost -> classRoomPost.getId().equals(postID)).findFirst().ifPresent(classRoomPost -> {
            classRoomPost.getFiles().forEach(file -> {
                try {
                    Files.delete(new File(file).toPath());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        });
        classRoom.getPosts().removeIf(classRoomPost -> classRoomPost.getId().equals(postID));
        classRoomRepository.save(classRoom);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public void removeTeacherFromClassRooms(String teacherEmail) {
        List<ClassRoom> cours = classRoomRepository.findAllByTeacher(teacherEmail).orElseThrow(() -> new ClassRoomNotFoundException("ClassRooms not found"));
        User teacher = userRepository.findByEmail(teacherEmail).orElseThrow(() -> new UserNotFoundException("Teacher not found"));
        cours.forEach(classroom -> {
            classroom.setTeacher(null);
            teacher.getEducation().getClassroomsID().remove(classroom.getId());
            userRepository.save(teacher);
            classRoomRepository.save(classroom);
        });
    }

    @Override
    public ResponseEntity<byte[]> downloadFile(String classroomID, String fileName) {
        log.info("Downloading file {}", fileName);
        ClassRoom classRoom = classRoomRepository.findById(classroomID).orElseThrow();
        List<ClassRoomPost> posts = classRoom.getPosts();
        for (ClassRoomPost post : posts) {
            for (String filePath : post.getFiles()) {
                String normalizedFilePath = filePath.replace("\\", "/");
                String extractedFileName = normalizedFilePath.substring(normalizedFilePath.lastIndexOf('/') + 1);
                if (extractedFileName.equals(fileName)) {
                    log.info("File found");
                    try {
                        return ResponseEntity.ok(Files.readAllBytes(new File(normalizedFilePath).toPath()));
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }
        }
        return ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<List<ClassRoomResponse>> getMyClassRooms(Principal principal) {
        User user = userRepository.findUserByEmail(principal.getName());
        List<ClassRoom> cours = new ArrayList<>();
        if(user.getRoles().contains(Role.TEACHER))
        {
            cours = classRoomRepository.findAllByTeacher(user.getEmail()).orElseThrow(() -> new ClassRoomNotFoundException("ClassRooms not found"));
        }else{
            cours = classRoomRepository.findAllByGroup(user.getEducation().getGroupID()).orElseThrow(() -> new ClassRoomNotFoundException("ClassRooms not found"));
        }
        return ResponseEntity.ok(cours.stream().map(classroom -> ClassRoomResponse.builder()
                .id(classroom.getId())
                .course(classroom.getCourse())
                .teacher(classroom.getTeacher())
                .group(classroom.getGroup())
                .institutionID(classroom.getInstitutionID())
                .build()).toList());
    }

    @Override
    public ResponseEntity<HttpStatus> createProgramClassRooms(String institutionID, String programID, Semester semester, Principal principal) {
        log.info("Creating program classrooms");
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        Program program = programRepository.findById(programID)
                .orElseThrow(() -> new ProgramNotFoundException("Program not found"));

        List<Group> groups = groupRepository.findByProgram(programID)
                .orElseThrow(() -> new GroupNotFoundException("No groups found for program"));

        if (groups.isEmpty()) {
            throw new GroupNotFoundException("No groups found for program");
        }

        AtomicInteger classroomAlreadyCreated = new AtomicInteger();
        List<String> modules = program.getModules();
        if (modules == null || modules.isEmpty()) {
            throw new CourseNotFoundException("No modules found for program");
        }
        List<Module> moduleList = moduleRepository.findAllById(modules);
        log.info("groups size: "+groups.size());
        log.info("modules size: "+modules.size());

        for (Group group : groups) {
            for(Module module: moduleList) {
                for (String courseID : module.getCoursesID()) {
                    if (!classRoomRepository.existsByCourseAndGroup(courseID, group.getId())) {
                        log.info("Creating classroom for course: " + courseID + " and group: " + group.getId());
                        Course course = courseRepository.findById(courseID)
                                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
                        if (semester != null && course.getSemester() == null) {
                            throw new CourseSemesterNotSetException(course.getName() + " semester not set");
                        }
                        log.info("course semester: " + course.getSemester());
                        log.info("semester: " + semester);
                        if (semester == null || course.getSemester().equals(semester)) {
                            log.info(String.valueOf(course.getSemester()));
                            ClassRoom classRoom = ClassRoom.builder()
                                    .course(courseID)
                                    .institutionID(institution.getId())
                                    .teacher(null)
                                    .group(group.getId())
                                    .posts(new ArrayList<>())
                                    .build();
                            classRoomRepository.save(classRoom);
                            institution.getClassRoomsID().add(classRoom.getId());
                            institutionRepository.save(institution);
                            group.getClassRooms().add(classRoom.getId());
                            groupRepository.save(group);
                        }
                    } else {
                        Course course = courseRepository.findById(courseID)
                                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
                        if (semester == null || (course.getSemester() != null && course.getSemester().equals(semester))) {
                            classroomAlreadyCreated.getAndIncrement();
                        }
                    }
                }
            }
        }

      /* if (semester != null) {
            modules = modules.stream()
                    .filter(moduleID -> {
                        Course course = courseRepository.findById(moduleID)
                                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
                        if (course.getSemester() != null) {
                            return course.getSemester().equals(semester);
                        }else{
                            throw new CourseSemesterNotSetException("you must set semester for all modules");
                        }
                    })
                    .toList();
        }*/

        log.info("ClassRooms already created: " + classroomAlreadyCreated);
        log.info("Program modules size: " + modules.size());
        log.info("Groups size: " + groups.size());

        if (classroomAlreadyCreated.get() == (modules.size() * groups.size())) {
            throw new ClassRoomAlreadyCreatedException("ClassRooms already created for all groups and modules");
        }

        return ResponseEntity.ok(HttpStatus.OK);
    }

    private List<byte[]> getBytesFromFiles(List<String> files) {
        return files.stream().map(file -> {
            try {
                return Files.readAllBytes(new File(file).toPath());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).toList();
    }
    private List<String> uploadFiles(MultipartFile[] files,String classroomID,Institution institution) {
        log.info("Uploading files");
        String baseDir = "upload" + File.separator + institution.getId()+ File.separator +classroomID  + File.separator;
        return Stream.of(files).map(file -> {
            try {
                File dir = new File(baseDir);
                if (!dir.exists()) {
                    boolean dirsCreated = dir.mkdirs();
                    if (!dirsCreated) {
                        throw new IOException("Failed to create directories");
                    }
                }
                String originalFileName = file.getOriginalFilename();
                String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
                // Generate a random filename
                String newFileName = UUID.randomUUID() + extension;
                // Define the path to the new file
                String filePath = baseDir + newFileName;
                log.info("File path: " + filePath);
                Files.copy(file.getInputStream(), new File(filePath).toPath());
                log.info("File uploaded");
                return filePath;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).toList();
    }
    //getallclassrooms:addedByNourChallouf
    public List<ClassRoomResponse>findAll() {
        return classRoomRepository.findAll(Sort.by("id")).stream().map(classroom -> ClassRoomResponse.builder()
                .id(classroom.getId())
                .course(classroom.getCourse())
                .teacher(classroom.getTeacher())
                .group(classroom.getGroup())
                .posts(classroom.getPosts() != null ? classroom.getPosts().stream().map(classRoomPost -> ClassRoomPostResponse.builder()
                        .id(classRoomPost.getId())
                        .title(classRoomPost.getTitle())
                        .description(classRoomPost.getDescription())
                        .created(classRoomPost.getCreated())
                        .files(classRoomPost.getFiles() != null ? returnOnlyFileName(classRoomPost.getFiles()) : null)
                        .build()).toList() : List.of())
                .institutionID(classroom.getInstitutionID())
                .build()).toList();
    }

    public ClassRoom findClassRoomById(String id) {
        return classRoomRepository.findById(id).orElseThrow(() -> new ClassRoomNotFoundException("ClassRoom not found"));
    }
}
