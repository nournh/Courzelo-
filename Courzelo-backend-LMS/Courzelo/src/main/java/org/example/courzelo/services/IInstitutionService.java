package org.example.courzelo.services;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.example.courzelo.dto.requests.institution.CalendarEventRequest;
import org.example.courzelo.dto.requests.institution.InstitutionMapRequest;
import org.example.courzelo.dto.requests.institution.InstitutionRequest;
import org.example.courzelo.dto.requests.UserEmailsRequest;
import org.example.courzelo.dto.requests.institution.SemesterRequest;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.dto.responses.StatusMessageResponse;
import org.example.courzelo.dto.responses.institution.*;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.models.institution.Timeslot;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

public interface IInstitutionService {
    ResponseEntity<PaginatedInstitutionsResponse> getInstitutions(int page, int sizePerPage, String keyword);
    ResponseEntity<StatusMessageResponse> addInstitution(InstitutionRequest institutionRequest);
    ResponseEntity<HttpStatus> updateInstitutionInformation(String institutionID, InstitutionRequest institutionRequest,Principal principal);
    ResponseEntity<StatusMessageResponse> deleteInstitution(String institutionID);
    ResponseEntity<InstitutionResponse> getInstitutionByID(String institutionID);
    ResponseEntity<PaginatedInstitutionUsersResponse> getInstitutionUsers(String institutionID, String keyword, String role, int page, int sizePerPage);
    void removeAllInstitutionUsers(Institution institution);
    ResponseEntity<HttpStatus> addInstitutionUser(String institutionID, String email, String role,Principal principal);
    ResponseEntity<HttpStatus> removeInstitutionUser(String institutionID, String email,Principal principal);
    ResponseEntity<HttpStatus> addInstitutionUserRole(String institutionID, String email, String role, Principal principal);
    ResponseEntity<HttpStatus> removeInstitutionUserRole(String institutionID, String email, String role, Principal principal);

    ResponseEntity<HttpStatus> setInstitutionMap(String institutionID, InstitutionMapRequest institutionMapRequest, Principal principal);


    ResponseEntity<HttpStatus> uploadInstitutionImage(String institutionID, MultipartFile file, Principal principal);

    ResponseEntity<byte[]> getInstitutionImage(String institutionID, Principal principal);

    ResponseEntity<InvitationsResultResponse> inviteUsers(String institutionID, UserEmailsRequest emailsRequest, String role,List<String> skills, Principal principal);

    ResponseEntity<HttpStatus> acceptInvite(String code,Principal principal);

    ResponseEntity<List<String>> getInstitutionStudents(String institutionID);

    ResponseEntity<List<String>> getInstitutionTeachers(String institutionID);

    ResponseEntity<List<GroupResponse>> getInstitutionGroups(String institutionID);

    ResponseEntity<HttpStatus> setSemester(@NotNull String institutionID, @Valid SemesterRequest semesterRequest, Principal principal);

    ResponseEntity<HttpStatus> clearSemester(@NotNull String institutionID, Principal principal);

    ResponseEntity<List<TeacherResponse>> getInstitutionFilteredTeachers(@NotNull String institutionID, List<String> skills);

    ResponseEntity<HttpStatus> updateTeacherDisponibility( @NotNull @Email String teacherEmail, List<InstitutionTimeSlot> disponibilitySlots);

    ResponseEntity<HttpStatus> updateInstitutionTimeSlots(@NotNull String institutionID, InstitutionTimeSlotsConfiguration timeSlots);

    ResponseEntity<InstitutionTimeSlotsConfiguration> getInstitutionTimeSlots(@NotNull String institutionID);

    ResponseEntity<HttpStatus> updateSkills(@NotNull String institutionID,String userEmail, List<String> skills);
}
