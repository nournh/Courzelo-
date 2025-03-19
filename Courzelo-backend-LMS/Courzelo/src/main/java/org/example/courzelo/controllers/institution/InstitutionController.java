package org.example.courzelo.controllers.institution;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.institution.CalendarEventRequest;
import org.example.courzelo.dto.requests.institution.InstitutionMapRequest;
import org.example.courzelo.dto.requests.institution.InstitutionRequest;
import org.example.courzelo.dto.requests.UserEmailsRequest;
import org.example.courzelo.dto.requests.institution.SemesterRequest;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.dto.responses.StatusMessageResponse;
import org.example.courzelo.dto.responses.institution.*;
import org.example.courzelo.models.institution.Timeslot;
import org.example.courzelo.serviceImpls.TimetableGenerationService;
import org.example.courzelo.services.IInstitutionService;
import org.example.courzelo.services.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/institution")
@AllArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class InstitutionController {
    private final IInstitutionService iInstitutionService;
    private final TimetableGenerationService timetableGenerationService;
    private final IUserService iUserService;
    @GetMapping("/all")
    public ResponseEntity<PaginatedInstitutionsResponse> getInstitutions(@RequestParam(defaultValue = "0") int page,
                                                                         @RequestParam(defaultValue = "10") int sizePerPage,
                                                                         @RequestParam(required = false) String keyword) {
        return iInstitutionService.getInstitutions(page, sizePerPage, keyword);
    }
    @GetMapping("/{institutionID}/filtered-teachers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<List<TeacherResponse>> getInstitutionFilteredTeachers(@PathVariable @NotNull String institutionID, @RequestParam List<String> skills) {
        return iInstitutionService.getInstitutionFilteredTeachers(institutionID,skills);
    }
    @GetMapping("/{institutionID}/students")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<List<String>> getInstitutionStudents(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.getInstitutionStudents(institutionID);
    }
    @GetMapping("/{institutionID}/teachers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<List<String>> getInstitutionTeachers(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.getInstitutionTeachers(institutionID);
    }
    @GetMapping("/{institutionID}/groups")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<List<GroupResponse>> getInstitutionGroups(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.getInstitutionGroups(institutionID);
    }

    @PostMapping("/add")
    public ResponseEntity<StatusMessageResponse> addInstitution(@RequestBody @Valid InstitutionRequest institutionRequest) {
        return iInstitutionService.addInstitution(institutionRequest);
    }
    @PutMapping("/update/{institutionID}")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> updateInstitution(@PathVariable @NotNull String institutionID,
                                                                  @RequestBody InstitutionRequest institutionRequest,
                                                                   Principal principal) {
        return iInstitutionService.updateInstitutionInformation(institutionID, institutionRequest,principal);
    }
    @DeleteMapping("/delete/{institutionID}")
    public ResponseEntity<StatusMessageResponse> deleteInstitution(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.deleteInstitution(institutionID);
    }
    @GetMapping("/{institutionID}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InstitutionResponse> getInstitutionByID(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.getInstitutionByID(institutionID);
    }
    @GetMapping("/{institutionID}/users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<PaginatedInstitutionUsersResponse> getInstitutionUsers(@PathVariable @NotNull String institutionID,
                                                                                 @RequestParam(required = false) String keyword,
                                                                                 @RequestParam(required = false) String role,
                                                                                 @RequestParam(defaultValue = "0") int page,
                                                                                 @RequestParam(defaultValue = "10") int sizePerPage) {
        return iInstitutionService.getInstitutionUsers(institutionID,keyword, role, page, sizePerPage);
    }
    @PutMapping("/{institutionID}/invite_users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<InvitationsResultResponse> inviteUsers(@PathVariable @NotNull String institutionID,
                                                                 @RequestBody UserEmailsRequest emails,
                                                                 @RequestParam @NotNull String role,
                                                                 @RequestParam(required = false) List<String> skills,
                                                                 Principal principal) {
        return iInstitutionService.inviteUsers(institutionID, emails, role,skills, principal);
    }
    @PutMapping("{institutionID}/{userEmail}/update-skills")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> updateSkills(@PathVariable @NotNull String institutionID,
                                                                  @PathVariable @NotNull String userEmail,
                                                                 @RequestParam(required = false) List<String> skills) {
        return iInstitutionService.updateSkills(institutionID,userEmail,skills );
    }
    @PutMapping("/accept_invite/{code}")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAcceptInstitutionInvite(#code)")
    public ResponseEntity<HttpStatus> acceptInvite(@PathVariable @NotNull String code,Principal principal) {
        return iInstitutionService.acceptInvite(code,principal);
    }
    @PutMapping("/{institutionID}/add-user")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> addInstitutionUser(@PathVariable @NotNull String institutionID,
                                                         @RequestParam @Email String email,
                                                         @RequestParam @NotNull String role,
                                                         Principal principal) {
        return iInstitutionService.addInstitutionUser(institutionID, email, role, principal);
    }
    @DeleteMapping("/{institutionID}/remove-user")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> removeInstitutionUser(@PathVariable @NotNull String institutionID,
                                                            @RequestParam @Email String email,
                                                            Principal principal) {
        return iInstitutionService.removeInstitutionUser(institutionID, email, principal);
    }
    @PutMapping("/{institutionID}/remove-user-role")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> removeInstitutionUserRole(@PathVariable @NotNull String institutionID,
                                                               @RequestParam @Email String email,
                                                               @RequestParam @NotNull String role,
                                                               Principal principal) {
        return iInstitutionService.removeInstitutionUserRole(institutionID, email, role, principal);
    }
    @PutMapping("/{institutionID}/add-user-role")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> addInstitutionUserRole(@PathVariable @NotNull String institutionID,
                                                                @RequestParam @Email String email,
                                                                @RequestParam @NotNull String role,
                                                                Principal principal) {
        return iInstitutionService.addInstitutionUserRole(institutionID, email, role, principal);
    }
    @PutMapping("/{institutionID}/set-map")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> setInstitutionMap(@PathVariable @NotNull String institutionID,
                                                        @RequestBody @Valid InstitutionMapRequest institutionMapRequest,
                                                        Principal principal) {
        return iInstitutionService.setInstitutionMap(institutionID, institutionMapRequest, principal);
    }
    @PutMapping("/{institutionID}/set-semester")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> setInstitutionSemester(@PathVariable @NotNull String institutionID,
                                                        @RequestBody @Valid SemesterRequest semesterRequest,
                                                        Principal principal) {
        return iInstitutionService.setSemester(institutionID, semesterRequest, principal);
    }
    @PutMapping("/{institutionID}/clear-semester")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> clearInstitutionSemester(@PathVariable @NotNull String institutionID,
                                                             Principal principal) {
        return iInstitutionService.clearSemester(institutionID, principal);
    }
    @PostMapping("/{institutionID}/image")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> uploadInstitutionImage(@PathVariable @NotNull String institutionID,
                                                             @RequestParam("file") MultipartFile file, Principal principal) {
        return iInstitutionService.uploadInstitutionImage(institutionID,file, principal);
    }
    @GetMapping("/{institutionID}/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable @NotNull String institutionID,Principal principal) {
        return iInstitutionService.getInstitutionImage(institutionID,principal);
    }
    @PostMapping("/{institutionID}/generate-timetable")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<HttpStatus> generateTimetable(@PathVariable @NotNull String institutionID) {
        return timetableGenerationService.generateWeeklyTimetable(institutionID);
    }
    @GetMapping("/{institutionID}/timetable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TimetableResponse> getTimetable(@PathVariable @NotNull String institutionID,Principal principal) {
        return timetableGenerationService.getTimetable(institutionID,principal);
    }
    @PutMapping("/{teacherEmail}/update-teacher-disponibility")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<HttpStatus> updateTeacherDisponibility(@PathVariable @NotNull @Email String teacherEmail,
                                                                 @RequestBody List<InstitutionTimeSlot> disponibilitySlots) {
        return iInstitutionService.updateTeacherDisponibility( teacherEmail, disponibilitySlots);
    }
    @PutMapping("/{institutionID}/update-timeslots")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ResponseEntity<HttpStatus> updateInstitutionTimeSlots(@PathVariable @NotNull String institutionID,
                                                                 @RequestBody InstitutionTimeSlotsConfiguration timeSlots) {
        return iInstitutionService.updateInstitutionTimeSlots( institutionID, timeSlots);
    }
    @GetMapping("/{institutionID}/timeslots")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InstitutionTimeSlotsConfiguration> getInstitutionTimeSlots(@PathVariable @NotNull String institutionID) {
        return iInstitutionService.getInstitutionTimeSlots(institutionID);
    }
}
