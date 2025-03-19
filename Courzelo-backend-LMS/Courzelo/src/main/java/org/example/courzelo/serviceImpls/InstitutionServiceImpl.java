package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.institution.InstitutionMapRequest;
import org.example.courzelo.dto.requests.institution.InstitutionRequest;
import org.example.courzelo.dto.requests.UserEmailsRequest;
import org.example.courzelo.dto.requests.institution.SemesterRequest;
import org.example.courzelo.dto.responses.*;
import org.example.courzelo.dto.responses.institution.*;
import org.example.courzelo.dto.responses.institution.InvitationsResultResponse;
import org.example.courzelo.exceptions.*;
import org.example.courzelo.models.*;
import org.example.courzelo.models.institution.*;
import org.example.courzelo.repositories.*;
import org.example.courzelo.services.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class InstitutionServiceImpl implements IInstitutionService {
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final CalendarService calendarService;
    private final ICodeVerificationService codeVerificationService;
    private final IMailService mailService;
    private final IGroupService groupService;
    private final GroupRepository groupRepository;
    private final ClassRoomRepository classRoomRepository;
    private final IGroupService iGroupService;
    private final IClassRoomService iClassRoomService;
    private final IInvitationService iInvitationService;
    private final InvitationRepository invitationRepository;
    private final CodeVerificationRepository codeVerificationRepository;
    private final IProgramService iProgramService;
    private final static String INSTITUTION_NOT_FOUND = "Institution not found";
    private final static String GROUP_NOT_FOUND = "Group not found";

    @Override
    public ResponseEntity<PaginatedInstitutionsResponse> getInstitutions(int page, int sizePerPage, String keyword) {
        log.info("Fetching institutions for page: {}, sizePerPage: {}", page, sizePerPage);
        PageRequest pageRequest = PageRequest.of(page, sizePerPage);
        Query query = new Query().with(pageRequest);

        if (keyword != null && !keyword.trim().isEmpty()) {
            log.info("Searching for institutions with keyword: {}", keyword);
            Criteria criteria = new Criteria().orOperator(
                    Criteria.where("name").regex(keyword, "i"),
                    Criteria.where("slogan").regex(keyword, "i"),
                    Criteria.where("country").regex(keyword, "i"),
                    Criteria.where("address").regex(keyword, "i"),
                    Criteria.where("description").regex(keyword, "i"),
                    Criteria.where("website").regex(keyword, "i")
            );
            query.addCriteria(criteria);
        }
        log.info("Total institutions found: -1");
        List<Institution> institutions = mongoTemplate.find(query, Institution.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Institution.class);
        log.info("Total institutions found: {}", total);
        List<InstitutionResponse> institutionResponses = institutions.stream()
                .map(InstitutionResponse::new)
                .toList();
        log.info("Total institutions found2: {}", total);
        PaginatedInstitutionsResponse response = new PaginatedInstitutionsResponse();
        response.setInstitutions(institutionResponses);
        response.setCurrentPage(page);
        response.setTotalPages((int) Math.ceil((double) total / sizePerPage));
        response.setTotalItems(total);
        response.setItemsPerPage(sizePerPage);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<StatusMessageResponse> addInstitution(InstitutionRequest institutionRequest) {
        Institution institution = new Institution(institutionRequest);
        institutionRepository.save(institution);
        return ResponseEntity.ok(new StatusMessageResponse("Success","Institution added successfully"));
    }

    @Override
    public ResponseEntity<HttpStatus> updateInstitutionInformation(String institutionID, InstitutionRequest institutionRequest,Principal principal) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        institution.updateInstitution(institutionRequest);
        institutionRepository.save(institution);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<StatusMessageResponse> deleteInstitution(String institutionID) {
        iProgramService.deleteAllInstitutionPrograms(institutionID);
        groupService.deleteGroupsByInstitution(institutionID);
        removeAllInstitutionUsers(institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND)));
        institutionRepository.deleteById(institutionID);
        return ResponseEntity.ok(new StatusMessageResponse("Success","Institution deleted successfully"));
    }

    @Override
    public ResponseEntity<InstitutionResponse> getInstitutionByID(String institutionID) {
        return ResponseEntity.ok(new InstitutionResponse(institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND))));
    }


    @Override
    public ResponseEntity<PaginatedInstitutionUsersResponse> getInstitutionUsers(String institutionID, String keyword, String role, int page, int sizePerPage) {
        log.info("Fetching users for institution: {}, page: {}, sizePerPage: {}, keyword: {}, role: {}", institutionID, page, sizePerPage, keyword, role);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        List<User> users;
        if (role == null) {
            log.info("role is null");
            users = institution.getUsers().stream()
                    .map(userRepository::findUserByEmail)
                    .filter(Objects::nonNull) // Filter out null users
                    .toList();
        } else {
            log.info("role is not null");
            users = switch (role) {
                case "ADMIN" -> institution.getAdmins().stream()
                        .map(userRepository::findUserByEmail)
                        .filter(Objects::nonNull) // Filter out null users
                        .toList();
                case "TEACHER" -> institution.getTeachers().stream()
                        .map(userRepository::findUserByEmail)
                        .filter(Objects::nonNull) // Filter out null users
                        .toList();
                case "STUDENT" -> institution.getStudents().stream()
                        .map(userRepository::findUserByEmail)
                        .filter(Objects::nonNull) // Filter out null users
                        .toList();
                default -> institution.getUsers().stream()
                        .map(userRepository::findUserByEmail)
                        .filter(Objects::nonNull) // Filter out null users
                        .toList();
            };
        }
        if (users.isEmpty()) {
            return ResponseEntity.ok(PaginatedInstitutionUsersResponse.builder()
                    .users(new ArrayList<>())
                    .currentPage(page)
                    .totalPages(0)
                    .totalItems(0)
                    .itemsPerPage(sizePerPage)
                    .build()
            );
        }
        log.info("users {}", users);
        log.info("after role");
        if (keyword != null && !keyword.trim().isEmpty()) {
            users = users.stream()
                    .filter(user ->
                            Optional.ofNullable(user.getProfile().getName()).orElse("").toLowerCase().contains(keyword.toLowerCase()) ||
                                    Optional.ofNullable(user.getProfile().getLastname()).orElse("").toLowerCase().contains(keyword.toLowerCase()) ||
                                    Optional.ofNullable(user.getProfile().getTitle()).orElse("").toLowerCase().contains(keyword.toLowerCase()) ||
                                    Optional.ofNullable(user.getProfile().getCountry()).orElse("").toLowerCase().contains(keyword.toLowerCase()) ||
                                    user.getRoles().stream().anyMatch(userRole -> userRole.name().toLowerCase().contains(keyword.toLowerCase())) ||
                                    Optional.ofNullable(user.getProfile().getGender()).orElse("").toLowerCase().contains(keyword.toLowerCase()) ||
                                    Optional.ofNullable(user.getEmail()).orElse("").toLowerCase().contains(keyword.toLowerCase()))
                    .toList();
        }
        log.info("after keyword");
        int start = page * sizePerPage;
        log.info("after keyword");
        int end = Math.min((start + sizePerPage), users.size());
        log.info("after keyword");
        List<InstitutionUserResponse> institutionUserResponses = users.subList(start, end).stream()
                .map(user -> InstitutionUserResponse.builder()
                        .email(user.getEmail())
                        .name(user.getProfile().getName())
                        .lastname(user.getProfile().getLastname())
                        .roles(getUserRoleInInstitution(user, institution).stream().map(Role::name).toList())
                        .country(user.getProfile().getCountry())
                        .gender(user.getProfile().getGender())
                        .disponibilitySlots(user.getEducation().getDisponibilitySlots())
                        .skills(user.getEducation().getSkill())
                        .build())
                .collect(Collectors.toList());
        log.info("after response");
        return ResponseEntity.ok(PaginatedInstitutionUsersResponse.builder()
                .users(institutionUserResponses)
                .currentPage(page)
                .totalPages((int) Math.ceil((double) users.size() / sizePerPage))
                .totalItems(users.size())
                .itemsPerPage(sizePerPage)
                .build()
        );
    }

    @Override
    public void removeAllInstitutionUsers(Institution institution) {
        institution.getUsers().forEach(user -> {
            userRepository.findByEmail(user).ifPresent(user1 -> {
                user1.getEducation().setInstitutionID(null);
                if (institution.getAdmins() != null && institution.getAdmins().contains(user)) {
                    user1.getRoles().remove(Role.ADMIN);
                }
                if (institution.getTeachers() != null && institution.getTeachers().contains(user)) {
                    user1.getRoles().remove(Role.TEACHER);
                }
                if (institution.getStudents() != null && institution.getStudents().contains(user)) {
                    user1.getRoles().remove(Role.STUDENT);
                }
                userRepository.save(user1);
            });
        });
    }

    @Override
    public ResponseEntity<HttpStatus> removeInstitutionUser(String institutionID, String email, Principal principal) {
        log.info("Removing user from institution {} with email: {}", institutionID, email);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        log.info("Institution found");
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("User not found"));
        if(isUserInInstitution(user, institution)){
            log.info("User in institution");
            if(institution.getAdmins().contains(user.getEmail())){
                user.getRoles().remove(Role.ADMIN);
                institution.getAdmins().remove(user.getEmail());
                log.info("User removed from admins");
            }
            if (institution.getTeachers().contains(user.getEmail())){
                institution.getTeachers().remove(user.getEmail());
                user.getRoles().remove(Role.TEACHER);
                iClassRoomService.removeTeacherFromClassRooms(user.getEmail());
                log.info("User removed from teachers");
            }
            if (institution.getStudents().contains(user.getEmail())){
                user.getRoles().remove(Role.STUDENT);
                institution.getStudents().remove(user.getEmail());
                iGroupService.removeStudentFromGroup(user);
                log.info("User removed from students");
            }
            user.getEducation().setInstitutionID(null);
            log.info("User removed from institution");
            userRepository.save(user);
            institutionRepository.save(institution);
            return ResponseEntity.ok().build();
        }
        throw new UserNotPartOfInstitutionException(user.getEmail()+" not part of "+ institution.getName());
    }

    @Override
    public ResponseEntity<HttpStatus> addInstitutionUserRole(String institutionID, String email, String role, Principal principal) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("User not found"));
        if(isUserInInstitution(user, institution)){
            if(role.equals("ADMIN")){
                if(institution.getAdmins().contains(user.getEmail())){
                    throw new UserAlreadyHasRoleException(user.getEmail()+" already has role "+role.toLowerCase());
                }
                institution.getAdmins().add(user.getEmail());
                if (!user.getRoles().contains(Role.ADMIN)) {
                    user.getRoles().add(Role.ADMIN);
                }
            }else if(role.equals("TEACHER")) {
                if (institution.getTeachers().contains(user.getEmail())) {
                    throw new UserAlreadyHasRoleException(user.getEmail()+" already has role "+role.toLowerCase());
                }
                institution.getTeachers().add(user.getEmail());
                if (!user.getRoles().contains(Role.TEACHER)) {
                    user.getRoles().add(Role.TEACHER);
                }
            }else{
                if (institution.getStudents().contains(user.getEmail())) {
                    throw new UserAlreadyHasRoleException(user.getEmail()+" already has role "+role.toLowerCase());
                }
                institution.getStudents().add(user.getEmail());
                if (!user.getRoles().contains(Role.STUDENT)) {
                    user.getRoles().add(Role.STUDENT);
                }
            }
            userRepository.save(user);
            institutionRepository.save(institution);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @Override
    public ResponseEntity<HttpStatus> removeInstitutionUserRole(String institutionID, String email, String role, Principal principal) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("User not found"));
        if(isUserInInstitution(user, institution)){
            if(role.equals("ADMIN")){
                if(institution.getAdmins().contains(user.getEmail())){
                    institution.getAdmins().remove(user.getEmail());
                    user.getRoles().remove(Role.ADMIN);
                }
            }else if(role.equals("TEACHER")) {
                if (institution.getTeachers().contains(user.getEmail())) {
                    institution.getTeachers().remove(user.getEmail());
                    user.getRoles().remove(Role.TEACHER);
                }
            }else{
                if (institution.getStudents().contains(user.getEmail())) {
                    institution.getStudents().remove(user.getEmail());
                    user.getRoles().remove(Role.STUDENT);
                }
            }
            if(getUserRoleInInstitution(user, institution).isEmpty()){
                user.getEducation().setInstitutionID(null);
            }
            userRepository.save(user);
            institutionRepository.save(institution);
            return ResponseEntity.ok().build();
        }
        throw new UserNotPartOfInstitutionException(user.getEmail()+" not part of "+ institution.getName());
    }

    @Override
    public ResponseEntity<HttpStatus> setInstitutionMap(String institutionID, InstitutionMapRequest institutionMapRequest, Principal principal) {
        log.info("Setting institution map for institution: {}", institutionID);
        log.info("Latitude: {}, Longitude: {}", institutionMapRequest.getLatitude(), institutionMapRequest.getLongitude());
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        institution.setLatitude(institutionMapRequest.getLatitude());
        institution.setLongitude(institutionMapRequest.getLongitude());
        institutionRepository.save(institution);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<HttpStatus> uploadInstitutionImage(String institutionID, MultipartFile file, Principal principal) {
        try {
            Institution institution= institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
            // Define the path where you want to save the image
            String baseDir = "upload" + File.separator + institution.getName() + File.separator + "logo" + File.separator;

            // Create the directory if it doesn't exist
            File dir = new File(baseDir);
            if (!dir.exists()) {
                boolean dirsCreated = dir.mkdirs();
                if (!dirsCreated) {
                    throw new IOException("Failed to create directories");
                }
            }
            // Get the original file name
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            // Generate a random filename
            String newFileName = UUID.randomUUID() + extension;
            // Define the path to the new file
            String filePath = baseDir + newFileName;
            log.info("File path: " + filePath);
            Files.copy(file.getInputStream(), new File(filePath).toPath());
            // Save the file to the server
            //file.transferTo(new File(filePath));
            //delete old image
            if(institution.getLogo() != null)
            {
                File oldImage = new File(institution.getLogo());
                if(oldImage.exists())
                {
                    oldImage.delete();
                }
            }
            // Save the file path and name in the user's profile
            institution.setLogo(filePath);
            // Save the user
            institutionRepository.save(institution);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error uploading image: " + e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @Override
    public ResponseEntity<byte[]> getInstitutionImage(String institutionID, Principal principal) {
        try {
            // Get the user
            Institution instituion = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
            if(instituion.getLogo() == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            String filePath = instituion.getLogo();
            // Read the file
            byte[] image = Files.readAllBytes(new File(filePath).toPath());
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            log.error("Error getting image: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    public ResponseEntity<InvitationsResultResponse> inviteUsers(String institutionID, UserEmailsRequest emails, String role,List<String> skills, Principal principal) {
        log.info("Inviting user to institution {} with emails: {} and role : {} ", institutionID, emails , role);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        InvitationsResultResponse invitationsResultResponse = InvitationsResultResponse.builder()
                .emailsAlreadyAccepted(new ArrayList<>())
                .emailsNotFound(new ArrayList<>())
                .build();
        emails.getEmails().forEach(
                email -> {
                   InvitationsResultResponse emailResponse = inviteUser(institutionID, email, role,skills, institution);
                   if(emailResponse != null){
                       if(!emailResponse.getEmailsNotFound().isEmpty()){
                           invitationsResultResponse.getEmailsNotFound().addAll(emailResponse.getEmailsNotFound());
                       }
                       if(!emailResponse.getEmailsAlreadyAccepted().isEmpty()){
                           invitationsResultResponse.getEmailsAlreadyAccepted().addAll(emailResponse.getEmailsAlreadyAccepted());
                       }
                   }
                }
        );
        log.info("Failed emails: {}", invitationsResultResponse);
        return ResponseEntity.ok(invitationsResultResponse);
    }

    private InvitationsResultResponse inviteUser(String institutionID, String email, String role,List<String> skills, Institution institution) {
        User user = userRepository.findUserByEmail(email);
        InvitationsResultResponse invitationsResultResponse = InvitationsResultResponse.builder()
                .emailsAlreadyAccepted(new ArrayList<>())
                .emailsNotFound(new ArrayList<>())
                .build();
        if (user != null) {
            Invitation invitation = invitationRepository.findByEmailAndInstitutionID(email, institutionID).orElse(null);
            if (invitation == null ||  !invitation.getStatus().equals(InvitationStatus.ACCEPTED)) {
                CodeVerification codeVerification = codeVerificationRepository.findByEmailAndInstitutionID(email, institutionID).orElse(null);
                if(codeVerification == null)
                {
                    codeVerification = new CodeVerification(CodeType.INSTITUTION_INVITATION, UUID.randomUUID().toString(), email, Role.valueOf(role), institutionID, Instant.now().plusSeconds(86400));
                    codeVerificationRepository.save(codeVerification);
                }
                iInvitationService.createInvitation(institutionID, email, Role.valueOf(role),skills, codeVerification.getId(), LocalDateTime.ofInstant(codeVerification.getExpiryDate(), ZoneId.systemDefault() )
                        );
                    mailService.sendInstituionInvitationEmail(email, institution,codeVerification);
                return invitationsResultResponse;
            }else{
                invitationsResultResponse.getEmailsAlreadyAccepted().add(email);
                return invitationsResultResponse;
            }
        }else{
            invitationsResultResponse.getEmailsNotFound().add(email);
            return invitationsResultResponse;
        }
    }

    @Override
    public ResponseEntity<HttpStatus> acceptInvite(String code,Principal principal) {
        log.info("Accepting invite with code: {}", code);
        CodeVerification codeVerification = codeVerificationService.getCodeByCode(code);
        log.info("Code verification: {}", codeVerification);
        log.info("Code type is institution invitation");
        Institution institution = institutionRepository.findById(codeVerification.getInstitutionID()).orElseThrow();
        User user = userRepository.findUserByEmail(codeVerification.getEmail());
        log.info("Removing user from old institution");
        if(isUserInInstitution(user, institution) && getUserRoleInInstitution(user, institution).contains(codeVerification.getRole())){
            log.info("User already in institution");
            throw new UserAlreadyPartOfInstitutionException(user.getEmail()+" already "+codeVerification.getRole() + " in "+institution.getName());
        }
        if(user.getEducation().getInstitutionID()!=null && !isUserInInstitution(user, institution)){
            removeInstitutionUser(user.getEducation().getInstitutionID(), codeVerification.getEmail(), null);
        }
        addInstitutionToUser(user, institution, codeVerification.getRole());
        addUserToInstitution(user, institution, codeVerification.getRole());
        iInvitationService.updateInvitationStatus(codeVerification.getEmail(),institution.getId(), InvitationStatus.ACCEPTED);
        iInvitationService.setUserSkills(codeVerification.getEmail(),institution.getId());
        log.info("Deleting code");
        codeVerificationService.deleteCode(codeVerification.getEmail(), CodeType.INSTITUTION_INVITATION);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<String>> getInstitutionStudents(String institutionID) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        log.info("Getting students for institution: {}", institution.getStudents());
        return ResponseEntity.ok(institution.getStudents());
    }

    @Override
    public ResponseEntity<List<String>> getInstitutionTeachers(String institutionID) {
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        log.info("Getting teachers for institution: {}", institution.getTeachers());
        return ResponseEntity.ok(institution.getTeachers());
    }

    @Override
    public ResponseEntity<List<GroupResponse>> getInstitutionGroups(String institutionID) {
        log.info("Getting groups for institution: {}", institutionID);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        List<Group> groups = institution.getGroupsID().stream().map(
                groupID -> groupRepository.findById(groupID).orElseThrow(()-> new GroupNotFoundException(GROUP_NOT_FOUND))
        ).toList();
        log.info("Groups found: {}", groups);
        return ResponseEntity.ok(groups.stream().map(
                group -> GroupResponse.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .students(group.getStudents())
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
                        .build()).toList());
    }

    @Override
    public ResponseEntity<HttpStatus> setSemester(String institutionID, SemesterRequest semesterRequest, Principal principal) {
        log.info("Setting semester : {} for institution: {}",semesterRequest, institutionID);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        if (semesterRequest.getFirstSemesterStart() != null && semesterRequest.getSecondSemesterStart() != null && semesterRequest.getFirstSemesterStart().before(semesterRequest.getSecondSemesterStart())) {
            institution.setFirstSemesterStart(semesterRequest.getFirstSemesterStart());
            institution.setSecondSemesterStart(semesterRequest.getSecondSemesterStart());
            institutionRepository.save(institution);
            return ResponseEntity.ok().build();
        }
        throw new SemesterMustBeInOrderException("First semester must be before second semester");
    }

    @Override
    public ResponseEntity<HttpStatus> clearSemester(String institutionID, Principal principal) {
        log.info("Clearing semester for institution: {}", institutionID);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        institution.setFirstSemesterStart(null);
        institution.setSecondSemesterStart(null);
        institutionRepository.save(institution);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<List<TeacherResponse>> getInstitutionFilteredTeachers(String institutionID, List<String> skills) {
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(() -> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));

        List<TeacherResponse> filteredTeachers = institution.getTeachers().stream()
                .map(email -> userRepository.findByEmail(email).orElse(null))
                .filter(Objects::nonNull)
                .filter(teacher -> hasRequiredSkills(teacher, skills))
                .map(teacher -> TeacherResponse.builder().skills(teacher.getEducation().getSkill())
                        .email(teacher.getEmail())
                        .name(teacher.getProfile().getName())
                        .lastname(teacher.getProfile().getLastname())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredTeachers);
    }

    @Override
    public ResponseEntity<HttpStatus> updateTeacherDisponibility( String teacherEmail, List<InstitutionTimeSlot> disponibilitySlots) {

            User teacher = userRepository.findByEmail(teacherEmail)
                    .orElseThrow(() -> new UserNotFoundException("Teacher not found"));

            teacher.getEducation().setDisponibilitySlots(disponibilitySlots);
            userRepository.save(teacher);
            return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<HttpStatus> updateInstitutionTimeSlots(String institutionID, InstitutionTimeSlotsConfiguration timeSlots) {
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(() -> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        institution.setTimeSlotsDays(timeSlots.getDays());
        institution.setTimeSlots(timeSlots.getTimeSlots());

        institutionRepository.save(institution);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<InstitutionTimeSlotsConfiguration> getInstitutionTimeSlots(String institutionID) {
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(() -> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));

        return ResponseEntity.ok(InstitutionTimeSlotsConfiguration.builder().timeSlots(institution.getTimeSlots()).days(institution.getTimeSlotsDays()).build());
    }

    @Override
    public ResponseEntity<HttpStatus> updateSkills(String institutionID,String userEmail, List<String> skills) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.getEducation().setSkill(skills);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    private boolean hasRequiredSkills(User teacher, List<String> requiredSkills) {
        List<String> teacherSkills = teacher.getEducation().getSkill();
        for (String requiredSkill : requiredSkills) {
            for (String teacherSkill : teacherSkills) {
                if (teacherSkill.equalsIgnoreCase(requiredSkill) || teacherSkill.toLowerCase().contains(requiredSkill.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public ResponseEntity<HttpStatus> addInstitutionUser(String institutionID, String email, String role,Principal principal) {
        log.info("Adding user to institution {} with email: {} and role : {} ", institutionID, email , role);
        Institution institution = institutionRepository.findById(institutionID).orElseThrow(()-> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        if(isUserInInstitution(user, institution) && getUserRoleInInstitution(user, institution).contains(Role.valueOf(role))){
            log.info("User already in institution");
            throw new UserAlreadyPartOfInstitutionException("User already in institution");
        }
        addUserToInstitution(user, institution, Role.valueOf(role));
        addInstitutionToUser(user, institution, Role.valueOf(role));
        return ResponseEntity.ok().build();
    }
    public void addInstitutionToUser(User user, Institution institution, Role role){
            log.info("Setting user institution");
            if(user.getEducation() == null){
                user.setEducation(new UserEducation());
            }
            user.getEducation().setInstitutionID(institution.getId());

            if (!user.getRoles().contains(role)) {
                user.getRoles().add(role);
            }
            userRepository.save(user);
            log.info("User institution set");
    }
    public void addUserToInstitution(User user, Institution institution, Role role){
        log.info("Adding user to institution");
        switch (role) {
            case ADMIN -> institution.getAdmins().add(user.getEmail());
            case TEACHER -> institution.getTeachers().add(user.getEmail());
            case STUDENT -> institution.getStudents().add(user.getEmail());
        }
        institutionRepository.save(institution);
        log.info("User added to institution");
    }

    public boolean isUserInInstitution(User user, Institution institution){
        log.info("Checking if user {} is in institution {}",user.getId(),institution.getId());
        log.info("User is in insitution : {}", user.getEducation().getInstitutionID() != null && user.getEducation().getInstitutionID().equals(institution.getId()));
        return user.getEducation().getInstitutionID() != null && user.getEducation().getInstitutionID().equals(institution.getId());
    }
    public List<Role> getUserRoleInInstitution(User user, Institution institution){
        List<Role> roles= new ArrayList<>();
        if(institution.getAdmins().contains(user.getEmail())){
            roles.add(Role.ADMIN);
        }
        if(institution.getTeachers().contains(user.getEmail())){
            roles.add(Role.TEACHER);
        }
        if(institution.getStudents().contains(user.getEmail())){
            roles.add(Role.STUDENT);
        }
        return roles;
    }
}
