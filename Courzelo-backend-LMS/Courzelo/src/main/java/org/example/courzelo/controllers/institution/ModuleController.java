package org.example.courzelo.controllers.institution;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.ModuleRequest;
import org.example.courzelo.dto.responses.ModuleResponse;
import org.example.courzelo.dto.responses.PaginatedModuleResponse;
import org.example.courzelo.services.IModuleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/module")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
@PreAuthorize("isAuthenticated()")
public class ModuleController {
    private final IModuleService moduleService;
    @PostMapping("/create")
    public ResponseEntity<HttpStatus> createModule(@RequestBody ModuleRequest moduleRequest){
        return moduleService.createModule(moduleRequest);
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<HttpStatus> updateModule(@PathVariable String id, @RequestBody ModuleRequest moduleRequest){
        return moduleService.updateModule(id, moduleRequest);
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<HttpStatus> deleteModule(@PathVariable String id){
        return moduleService.deleteModule(id);
    }
    @GetMapping("/get/{id}")
    public ResponseEntity<ModuleResponse> getModuleById(@PathVariable String id){
        return moduleService.getModule(id);
    }
    @GetMapping("/get/all/program/{programID}")
    public ResponseEntity<PaginatedModuleResponse> getAllModules(@RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size,
                                                                 @PathVariable String programID,
                                                                 @RequestParam(required = false) String keyword){
        return moduleService.getModulesByProgramAndKeyword( programID, keyword,page, size);
    }
    @GetMapping("/get/all/institution/{institutionID}")
    public ResponseEntity<PaginatedModuleResponse> getAllModulesByInstitution(@RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @PathVariable String institutionID,
                                                        @RequestParam(required = false) String keyword){
        return moduleService.getModulesByInstitutionAndKeyword(institutionID, keyword, page, size);
    }
}
