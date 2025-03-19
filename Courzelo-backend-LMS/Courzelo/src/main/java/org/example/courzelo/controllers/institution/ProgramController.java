package org.example.courzelo.controllers.institution;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.institution.CalendarEventRequest;
import org.example.courzelo.dto.requests.program.ProgramRequest;
import org.example.courzelo.dto.responses.program.PaginatedProgramsResponse;
import org.example.courzelo.dto.responses.program.ProgramResponse;
import org.example.courzelo.dto.responses.program.SimplifiedProgramResponse;
import org.example.courzelo.services.IProgramService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/program")
@AllArgsConstructor
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class ProgramController {
    private final IProgramService programService;
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> createProgram(@RequestBody ProgramRequest programRequest, Principal principal){
        return programService.createProgram(programRequest, principal);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> updateProgram(@PathVariable String id, @RequestBody ProgramRequest programRequest){
        return programService.updateProgram(id, programRequest);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<HttpStatus> deleteProgram(@PathVariable String id){
        return programService.deleteProgram(id);
    }
    @GetMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<PaginatedProgramsResponse> getPrograms(@RequestParam int page, @RequestParam int sizePerPage,
                                                                 @RequestParam(required = false) String keyword, @RequestParam String institutionID){
        return programService.getProgramsByInstitution(page, sizePerPage, institutionID, keyword);
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')&&@customAuthorization.canAccessProgram(#id)")
    public ResponseEntity<ProgramResponse> getProgram(@PathVariable String id){
        return programService.getProgramById(id);
    }
    @GetMapping("/myProgram")
    public ResponseEntity<ProgramResponse> getProgram(Principal principal){
        return programService.getMyProgram(principal);
    }
    @GetMapping("/simplified/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.canAccessProgram(#id)")
    public ResponseEntity<SimplifiedProgramResponse> getSimplifiedProgram(@PathVariable String id){
        return programService.getSimplifiedProgramById(id);
    }
    @GetMapping("/simplified")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.isAdminInInstitution()")
    public ResponseEntity<List<SimplifiedProgramResponse>> getSimplifiedPrograms(@RequestParam String institutionID){
        return programService.getSimplifiedProgramsByInstitution(institutionID);
    }
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')&&@customAuthorization.canAccessProgram(#programID)")
    @PostMapping("/{programID}/generate-excel")
    public ResponseEntity<HttpStatus> generateExcel(@PathVariable @NotNull String programID, @RequestBody List<CalendarEventRequest> events, Principal principal) {
        return programService.generateExcel(programID,events,principal);
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{programID}/download-excel")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable @NotNull String programID,Principal principal) {
        return programService.downloadExcel(programID,principal);
    }
    @GetMapping("/{id}/module-credits-sum")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.canAccessProgram(#id)")
    public ResponseEntity<Integer> getProgramModuleCreditsSum(@PathVariable String id){
        return programService.getProgramModuleCreditsSum(id);
    }
}
