package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.ModuleRequest;
import org.example.courzelo.dto.responses.ModuleResponse;
import org.example.courzelo.dto.responses.PaginatedModuleResponse;
import org.example.courzelo.exceptions.ModuleAlreadyExistsException;
import org.example.courzelo.exceptions.ModuleNotFoundException;
import org.example.courzelo.models.institution.Module;
import org.example.courzelo.repositories.ModuleRepository;
import org.example.courzelo.services.IModuleService;
import org.example.courzelo.services.IProgramService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class ModuleService implements IModuleService {
    private final ModuleRepository moduleRepository;
    private final CourseServiceImpl courseService;
    private final IProgramService programService;
    @Override
    public ResponseEntity<HttpStatus> createModule(ModuleRequest moduleRequest) {
        if(moduleRequest.getName() == null
                || moduleRequest.getProgramID() == null
                || moduleRequest.getInstitutionID() == null){
            throw new IllegalArgumentException("Module name, program and institution are required");
        }
        if(moduleRepository.existsByNameAndProgramID(moduleRequest.getName(), moduleRequest.getProgramID())){
            throw new ModuleAlreadyExistsException(moduleRequest.getName());
        }
        Module module = Module.builder()
                .name(moduleRequest.getName())
                .description(moduleRequest.getDescription())
                .programID(moduleRequest.getProgramID())
                .institutionID(moduleRequest.getInstitutionID())
                .coursesID(moduleRequest.getCoursesID() == null ? new ArrayList<>() : moduleRequest.getCoursesID())
                .build();
        moduleRepository.save(module);
        programService.addModuleToProgram(module.getId(), moduleRequest.getProgramID());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Override
    public ResponseEntity<HttpStatus> updateModule(String moduleID, ModuleRequest moduleRequest) {
        if(moduleRequest.getName() == null){
            throw new IllegalArgumentException("Module name is required");
        }
        Module existingModule = moduleRepository.findById(moduleID).orElseThrow(() -> new ModuleNotFoundException("Module not found"));

        if (!existingModule.getName().equals(moduleRequest.getName())) {
            if(moduleRepository.existsByNameAndProgramID(moduleRequest.getName(), existingModule.getProgramID())){
                throw new ModuleAlreadyExistsException(moduleRequest.getName());
            }
        }

        // Find courses to remove
   /*     List<String> coursesToRemove = new ArrayList<>();
        for(String courseID : existingModule.getCoursesID()){
            if(!moduleRequest.getCoursesID().contains(courseID)){
                coursesToRemove.add(courseID);
            }
        }
        List<String> coursesToAdd = new ArrayList<>();
        for(String courseID : moduleRequest.getCoursesID()){
            if(!existingModule.getCoursesID().contains(courseID)){
                coursesToAdd.add(courseID);
            }
        }*/


        // Update the module with new courses
        existingModule.setName(moduleRequest.getName());
        existingModule.setDescription(moduleRequest.getDescription());
      /*  existingModule.setProgramID(moduleRequest.getProgramID());
        existingModule.setInstitutionID(moduleRequest.getInstitutionID());
        existingModule.setCoursesID(moduleRequest.getCoursesID());*/

        // Save the updated module
       existingModule= moduleRepository.save(existingModule);
    /*   for (String courseID : coursesToAdd) {
              courseService.addModuleToCourse(existingModule.getId(), courseID);
       }
       for (String courseID : coursesToRemove) {
             courseService.removeModuleFromCourse(existingModule.getId(), courseID);
         }
            if(!existingModule.getProgramID().equals(moduleRequest.getProgramID())){
                programService.removeModuleFromProgram(existingModule.getId(), existingModule.getProgramID());
                programService.addModuleToProgram(existingModule.getId(), moduleRequest.getProgramID());
              }*/
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Override
    public ResponseEntity<HttpStatus> deleteModule(String moduleID) {
        Module module = moduleRepository.findById(moduleID).orElseThrow(() -> new ModuleNotFoundException("Module not found"));
        for(String courseID : module.getCoursesID()){
            courseService.removeModuleFromCourse(moduleID, courseID);
        }
        programService.removeModuleFromProgram(moduleID, module.getProgramID());
        moduleRepository.deleteById(moduleID);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Override
    public ResponseEntity<ModuleResponse> getModule(String moduleID) {
        Module module = moduleRepository.findById(moduleID).orElseThrow(() -> new ModuleNotFoundException("Module not found"));
        return ResponseEntity.ok(ModuleResponse.builder()
                .id(module.getId())
                .name(module.getName())
                .description(module.getDescription())
                .institutionID(module.getInstitutionID())
                .programID(module.getProgramID())
                .coursesID(module.getCoursesID())
                .build());
    }

    @Override
    public ResponseEntity<PaginatedModuleResponse> getModulesByProgramAndKeyword(String programID, String keyword, int page, int size) {
        log.info("Searching for modules by programID: {} and keyword: {}", programID, keyword);
        Pageable pageable = PageRequest.of(page, size);
        Page<Module> modulePage;
            modulePage = moduleRepository.searchByProgramIDAndName(programID, keyword,pageable);
        List<ModuleResponse> moduleResponses = new ArrayList<>();
        for(Module module : modulePage.getContent()){
            moduleResponses.add(ModuleResponse.builder()
                    .id(module.getId())
                    .name(module.getName())
                    .description(module.getDescription())
                    .institutionID(module.getInstitutionID())
                    .programID(module.getProgramID())
                    .coursesID(module.getCoursesID())
                    .build());
        }
        log.info("Found {} modules", modulePage.getTotalElements());
        log.info("Returning {} modules", modulePage.getNumberOfElements());
        return ResponseEntity.ok(PaginatedModuleResponse.builder()
                .modules(moduleResponses)
                .totalPages(modulePage.getTotalPages())
                .totalItems(modulePage.getTotalElements())
                .currentPage(modulePage.getNumber())
                .itemsPerPage(modulePage.getSize())
                .build());
    }

    @Override
    public ResponseEntity<PaginatedModuleResponse> getModulesByInstitutionAndKeyword(String institutionID, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Module> modulePage;
            modulePage = moduleRepository.searchByInstitutionIDAndName(institutionID, keyword,pageable);
        List<ModuleResponse> moduleResponses = new ArrayList<>();
        for(Module module : modulePage.getContent()){
            moduleResponses.add(ModuleResponse.builder()
                    .id(module.getId())
                    .name(module.getName())
                    .description(module.getDescription())
                    .institutionID(module.getInstitutionID())
                    .programID(module.getProgramID())
                    .coursesID(module.getCoursesID())
                    .build());
        }
        return ResponseEntity.ok(PaginatedModuleResponse.builder()
                .modules(moduleResponses)
                .totalPages(modulePage.getTotalPages())
                .totalItems(modulePage.getTotalElements())
                .currentPage(modulePage.getNumber())
                .itemsPerPage(modulePage.getSize())
                .build());
    }
}
