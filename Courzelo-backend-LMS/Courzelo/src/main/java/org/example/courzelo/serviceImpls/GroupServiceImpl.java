package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.GroupRequest;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.dto.responses.PaginatedGroupsResponse;
import org.example.courzelo.dto.responses.institution.SimplifiedClassRoomResponse;
import org.example.courzelo.exceptions.*;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.repositories.*;
import org.example.courzelo.services.IClassRoomService;
import org.example.courzelo.services.IGroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class GroupServiceImpl implements IGroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final IClassRoomService courseService;
    private final InstitutionRepository institutionRepository;
    private final ProgramRepository programRepository;
    @Override
    public ResponseEntity<GroupResponse> getGroup(String groupID) {
        Group group = groupRepository.findById(groupID).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        log.info("Fetching group {}", group);
        return ResponseEntity.ok(GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .students(group.getStudents())
                .institutionID(group.getInstitutionID())
                .classrooms(group.getClassRooms().stream().map(
                        courseID -> {
                            ClassRoom classRoom = classRoomRepository.findById(courseID).orElseThrow(() -> new ClassRoomNotFoundException("Course not found"));
                            return SimplifiedClassRoomResponse.builder()
                                    .classroomID(classRoom.getId())
                                    .teacher(classRoom.getTeacher())
                                    .course(classRoom.getCourse())
                                    .build();
                        }
                        ).toList()
                )
                .program(group.getProgram()!=null?group.getProgram():null)
                .build());
    }

    @Override
    public ResponseEntity<PaginatedGroupsResponse> getGroupsByInstitution(String institutionID, int page,String keyword ,int sizePerPage) {
        log.info("Fetching groups by institution {} page {} sizer per page {} keyword {}", institutionID, page, sizePerPage, keyword);
        Pageable pageable = PageRequest.of(page, sizePerPage);
        Page<Group> groupPage;
        if(keyword == null) {
            groupPage = groupRepository.findByInstitutionID(institutionID, pageable);
        } else {
            groupPage = groupRepository.findByInstitutionIDAndNameContainingIgnoreCase(institutionID, keyword, pageable);
        }
        List<Group> groups = groupPage.getContent().stream().toList();

        List<GroupResponse> groupResponses = groups.stream()
                .map(group -> GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .institutionID(group.getInstitutionID())
                        .students(group.getStudents())
                        .classrooms(group.getClassRooms() != null ? group.getClassRooms().stream().map(
                                        courseID -> {
                                            ClassRoom classRoom = classRoomRepository.findById(courseID).orElseThrow(() -> new ClassRoomNotFoundException("Course not found"));
                                            return SimplifiedClassRoomResponse.builder()
                                                    .classroomID(classRoom.getId())
                                                    .teacher(classRoom.getTeacher())
                                                    .course(classRoom.getCourse())
                                                    .build();
                                        }
                                ).toList() : null
                        )
                        .program(group.getProgram()!=null?group.getProgram():null)
                        .build())
                .collect(Collectors.toList());

        log.info("Groups fetched successfully {}", groupResponses);

        return ResponseEntity.ok(PaginatedGroupsResponse.builder()
                .groups(groupResponses)
                .currentPage(page)
                .totalPages(groupPage.getTotalPages())
                .totalItems(groupPage.getTotalElements())
                        .itemsPerPage(sizePerPage)
                .build());
    }

    @Override
    public ResponseEntity<HttpStatus> createGroup(GroupRequest groupRequest) {
        log.info("Creating group {}", groupRequest);
        if (groupRequest.getStudents() != null && !groupRequest.getStudents().isEmpty()) {
            List<String> students = new ArrayList<>(groupRequest.getStudents());
            students.forEach(
                    studentEmail -> {
                        if (!checkIfUserCanBeAddedToGroup(studentEmail, groupRequest.getInstitutionID())) {
                            log.info("User {} cannot be added to group", studentEmail);
                            groupRequest.getStudents().remove(studentEmail);
                        }
                    }
            );
        }
        log.info("Creating group");
        Group group = Group.builder()
                    .name(groupRequest.getName())
                    .institutionID(groupRequest.getInstitutionID())
                    .students(groupRequest.getStudents()!=null && !groupRequest.getStudents().isEmpty() ? groupRequest.getStudents() : new ArrayList<>())
                    .classRooms(new ArrayList<>())
                    .program(groupRequest.getProgram()!=null ? groupRequest.getProgram() : null)
                    .build();
            groupRepository.save(group);
            log.info("Group created");
            if (groupRequest.getStudents() != null && !groupRequest.getStudents().isEmpty()) {
                groupRequest.getStudents().forEach(
                        studentEmail -> addGroupToUser(group.getId(), studentEmail)
                );
            }
            addGroupToInstitution(group.getId(), groupRequest.getInstitutionID());
            if(groupRequest.getProgram()!=null){
                programRepository.findById(groupRequest.getProgram()).ifPresent(program -> {
                    if(program.getGroups()==null){
                        program.setGroups(new ArrayList<>());
                    }
                    program.getGroups().add(group.getId());
                    programRepository.save(program);
                });
            }

        return ResponseEntity.ok(HttpStatus.CREATED);

    }
    private boolean checkIfUserCanBeAddedToGroup(String userEmail, String institutionID) {
        log.info("Checking if user {} can be added to group", userEmail);
        User user = userRepository.findByEmail(userEmail).orElse(null);

        if (user == null) {
            log.info("User {} not found", userEmail);
            return false;
        }

        if (!user.getRoles().contains(Role.STUDENT)) {
            log.info("User {} does not have the STUDENT role", userEmail);
            return false;
        }

        if (user.getEducation() == null) {
            log.info("User {} does not have education information", userEmail);
            return false;
        }

        if (user.getEducation().getInstitutionID() == null) {
            log.info("User {} does not have an institution ID", userEmail);
            return false;
        }

        if (!user.getEducation().getInstitutionID().equals(institutionID)) {
            log.info("User {} is not in the institution {}", userEmail, institutionID);
            return false;
        }

        log.info("User {} can be added to group", userEmail);
        return true;
    }
    private void addGroupToUser(String groupID, String userEmail) {
        log.info("Adding group to user {}", userEmail);
        userRepository.findByEmail(userEmail).ifPresent(user -> {
            if(user.getEducation().getGroupID()!=null)
            {
                removeStudentFromGroup(user.getEducation().getGroupID(), userEmail);
            }
            user.getEducation().setGroupID(groupID);
            userRepository.save(user);
        });
    }
    private void addGroupToInstitution(String groupID, String institutionID) {
        institutionRepository.findById(institutionID).ifPresent(institution -> {
            institution.getGroupsID().add(groupID);
            institutionRepository.save(institution);
        });
    }
    private void addGroupToCourse(String groupID, String courseID) {
        classRoomRepository.findById(courseID).ifPresent(course -> {
            course.setGroup(groupID);
            classRoomRepository.save(course);
        });
    }
    @Override
    public ResponseEntity<HttpStatus> updateGroup(String groupID, GroupRequest groupRequest) {
        Group group = groupRepository.findById(groupID).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        group.setName(groupRequest.getName());
        if (groupRequest.getStudents() != null) {
            List<String> studentsToBeRemoved = new ArrayList<>();
            List<String> studentsToBeAdded = new ArrayList<>();
            group.getStudents().forEach(
                    studentEmail -> {
                        if (!groupRequest.getStudents().contains(studentEmail)) {
                            log.info("Removing user {} from group", studentEmail);
                            studentsToBeRemoved.add(studentEmail);
                        }
                    }
            );
            groupRequest.getStudents().forEach(
                    studentEmail -> {
                        if (!group.getStudents().contains(studentEmail)) {
                            log.info("Adding user {} to group", studentEmail);
                            studentsToBeAdded.add(studentEmail);
                        }
                    }
            );
            studentsToBeRemoved.forEach(
                    studentEmail -> removeStudentFromGroup(groupID, studentEmail)
            );
            studentsToBeAdded.forEach(
                    studentEmail -> {
                        if (checkIfUserCanBeAddedToGroup(studentEmail, group.getInstitutionID())) {
                            addStudentToGroup(groupID, studentEmail);
                            group.getStudents().add(studentEmail);
                        }
                    }
            );
        }else if(group.getStudents()!=null){
            group.getStudents().forEach(
                    studentEmail -> {
                        removeStudentFromGroup(groupID, studentEmail);
                        group.getStudents().remove(studentEmail);
                    }
            );
        }
        if(!Objects.equals(group.getProgram(), groupRequest.getProgram())){
            if(group.getProgram()!=null){
                programRepository.findById(group.getProgram()).ifPresent(program -> {
                    if (program.getGroups() != null && program.getGroups().contains(groupID)) {
                        program.getGroups().remove(groupID);
                        programRepository.save(program);
                    }
                });
            }
            group.getClassRooms().forEach(
                    this::removeGroupFromClassroom
            );
            group.setProgram(groupRequest.getProgram());
                programRepository.findById(groupRequest.getProgram()).ifPresent(program -> {
                    if(program.getGroups()==null){
                        program.setGroups(new ArrayList<>());
                    }
                    program.getGroups().add(groupID);
                    programRepository.save(program);
                });
                groupRepository.save(group);

        }
        groupRepository.save(group);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteGroup(String groupID) {
        Group group = groupRepository.findById(groupID).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        if (group.getStudents() != null) {
            log.info("Removing group from students");
            group.getStudents().forEach(
                    this::removeGroupFromUser
            );
        }
        if (group.getClassRooms() != null) {
            log.info("Removing group from courses");
            group.getClassRooms().forEach(
                    this::removeGroupFromClassroom
            );
        }
        Institution institution = institutionRepository.findById(group.getInstitutionID()).orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        if (institution.getGroupsID() != null && institution.getGroupsID().contains(groupID)) {
            institution.getGroupsID().remove(groupID);
            institutionRepository.save(institution);
        }
        if(group.getProgram()!=null){
            programRepository.findById(group.getProgram()).ifPresent(program -> {
                if (program.getGroups() != null && program.getGroups().contains(groupID)) {
                    program.getGroups().remove(groupID);
                    programRepository.save(program);
                }
            });
        }
        groupRepository.delete(group);
        log.info("Group deleted");
        return ResponseEntity.ok(HttpStatus.OK);
    }

    private void removeGroupFromUser(String studentEmail) {
        userRepository.findByEmail(studentEmail).ifPresent(user -> {
            user.getEducation().setGroupID(null);
            userRepository.save(user);
        });
    }
    private void removeGroupFromClassroom(String courseID) {
            courseService.deleteClassRoom(courseID);
    }

    @Override
    public ResponseEntity<HttpStatus> addStudentToGroup(String groupID, String student) {
        Group group = groupRepository.findById(groupID).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        if(group.getStudents().contains(student)) {
            return ResponseEntity.ok(HttpStatus.OK);
        }
        log.info("Adding user {} to group {}", student, groupID);
        User user = userRepository.findByEmail(student).orElseThrow(() -> new UserNotFoundException("User not found"));
        if(!Objects.equals(user.getEducation().getInstitutionID(), group.getInstitutionID()))
        {
            throw new UserNotPartOfInstitutionException("User "+student+" is not in the same institution as group " +group.getName());
        }
        group.getStudents().add(user.getEmail());
        log.info("group : "+group);
        user.getEducation().setGroupID(groupID);
        groupRepository.save(group);
        userRepository.save(user);
        log.info("User {} added to group {}", student, groupID);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public void removeStudentFromGroup(String groupID, String studentID) {
        log.info("Removing user {} from group {}", studentID, groupID);
        User user = userRepository.findByEmail(studentID).orElseThrow(() -> new UserNotFoundException("User not found"));
        Group group = groupRepository.findById(groupID).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        if (user != null && group.getStudents() != null && group.getStudents().contains(user.getEmail())) {
            log.info("Removing user {} from group {}", studentID, groupID);
            group.getStudents().remove(user.getEmail());
            user.getEducation().setGroupID(null);
            groupRepository.save(group);
            userRepository.save(user);
        }

    }

    @Override
    public void deleteGroupsByInstitution(String institutionID) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(() -> new InstitutionNotFoundException("Institution not found"));
        if (institution.getGroupsID() != null) {
            institution.getGroupsID().forEach(
                    this::deleteGroup
            );
        }
    }

    @Override
    public void removeStudentFromGroup(User user) {
        if (user.getEducation() != null && user.getEducation().getGroupID() != null) {
            Group group = groupRepository.findById(user.getEducation().getGroupID()).orElseThrow(() -> new GroupNotFoundException("Group not found"));
            group.getStudents().remove(user.getEmail());
            user.getEducation().setGroupID(null);
            userRepository.save(user);
            groupRepository.save(group);
        }
    }

    @Override
    public ResponseEntity<GroupResponse> getMyGroup(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (user.getEducation() == null || user.getEducation().getGroupID() == null) {
            throw new UserNotInGroupException("User not in a group");
        }
        Group group = groupRepository.findById(user.getEducation().getGroupID()).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        return ResponseEntity.ok(GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .students(group.getStudents())
                .institutionID(group.getInstitutionID())
                .build());
    }
}
