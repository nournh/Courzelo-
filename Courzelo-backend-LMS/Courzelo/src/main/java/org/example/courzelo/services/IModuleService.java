package org.example.courzelo.services;

import org.example.courzelo.dto.requests.ModuleRequest;
import org.example.courzelo.dto.responses.ModuleResponse;
import org.example.courzelo.dto.responses.PaginatedModuleResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public interface IModuleService {
    ResponseEntity<HttpStatus> createModule(ModuleRequest moduleRequest);
    ResponseEntity<HttpStatus> updateModule(String moduleID, ModuleRequest moduleRequest);
    ResponseEntity<HttpStatus> deleteModule(String moduleID);
    ResponseEntity<ModuleResponse> getModule(String moduleID);
    ResponseEntity<PaginatedModuleResponse> getModulesByProgramAndKeyword(String programID, String keyword, int page, int size);
    ResponseEntity<PaginatedModuleResponse> getModulesByInstitutionAndKeyword(String institutionID, String keyword, int page, int size);
}
