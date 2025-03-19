package org.example.courzelo.services;

import org.example.courzelo.dto.requests.institution.CalendarEventRequest;
import org.example.courzelo.dto.requests.program.ProgramRequest;
import org.example.courzelo.dto.responses.program.PaginatedProgramsResponse;
import org.example.courzelo.dto.responses.program.ProgramResponse;
import org.example.courzelo.dto.responses.program.SimplifiedProgramResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;

public interface IProgramService {
    ResponseEntity<HttpStatus> createProgram(ProgramRequest programRequest, Principal principal);
    ResponseEntity<HttpStatus> updateProgram(String id, ProgramRequest programRequest);
    ResponseEntity<HttpStatus> deleteProgram(String id);
    ResponseEntity<PaginatedProgramsResponse> getProgramsByInstitution(int page, int size,String institutionID, String keyword);
    ResponseEntity<ProgramResponse> getProgramById(String id);
    void deleteAllInstitutionPrograms(String institutionID);
    void addProgramToInstitution(String programID, String institutionID);
    void removeProgramFromInstitution(String programID, String institutionID);
    void addModuleToProgram(String moduleID, String programID);
    void removeModuleFromProgram(String moduleID, String programID);
    ResponseEntity<SimplifiedProgramResponse> getSimplifiedProgramById(String id);

    ResponseEntity<List<SimplifiedProgramResponse>> getSimplifiedProgramsByInstitution(String institutionID);

    ResponseEntity<ProgramResponse> getMyProgram(Principal principal);
    ResponseEntity<HttpStatus> generateExcel(String programID, List<CalendarEventRequest> events, Principal principal);

    ResponseEntity<byte[]> downloadExcel(String programID, Principal principal);

    ResponseEntity<Integer> getProgramModuleCreditsSum(String id);
}
