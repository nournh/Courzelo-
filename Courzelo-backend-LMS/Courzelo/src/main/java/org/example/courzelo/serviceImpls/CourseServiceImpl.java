package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.course.AssessmentRequest;
import org.example.courzelo.dto.requests.course.CourseRequest;
import org.example.courzelo.dto.responses.course.CourseResponse;
import org.example.courzelo.dto.responses.course.PaginatedCoursesResponse;
import org.example.courzelo.exceptions.*;
import org.example.courzelo.models.institution.Assessment;
import org.example.courzelo.models.institution.Course;
import org.example.courzelo.models.institution.Module;
import org.example.courzelo.models.institution.Program;
import org.example.courzelo.models.institution.Semester;
import org.example.courzelo.repositories.ClassRoomRepository;
import org.example.courzelo.repositories.CourseRepository;
import org.example.courzelo.repositories.ModuleRepository;
import org.example.courzelo.repositories.ProgramRepository;
import org.example.courzelo.services.ICourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@AllArgsConstructor
@Slf4j
public class CourseServiceImpl implements ICourseService {
    private final CourseRepository courseRepository;
    private final ProgramRepository programRepository;
    private final ModuleRepository moduleRepository;
    private final ClassRoomRepository classRoomRepository;
    @Override
    public ResponseEntity<HttpStatus> createCourse(CourseRequest courseRequest) {
        if(courseRequest.getName() == null || courseRequest.getDescription() == null || courseRequest.getModuleID() == null) {
            throw new RequestNotValidException("Course name, description and module are required");
        }
        if(courseRepository.existsByNameAndModuleID(courseRequest.getName(), courseRequest.getModuleID())) {
            throw new CourseAlreadyExistsException("Course with name " + courseRequest.getName() + " already exists");
        }
        log.info("Creating course");
        log.info("Course request: " + courseRequest);
        Module module = moduleRepository.findById(courseRequest.getModuleID()).orElseThrow(() -> new ModuleNotFoundException("Module not found"));
        Course course = Course.builder()
                .name(courseRequest.getName())
                .description(courseRequest.getDescription())
                .semester(courseRequest.getSemester() != null  ? Semester.valueOf(courseRequest.getSemester()) : null)
                .skills(courseRequest.getSkills())
                .ScoreToPass(courseRequest.getScoreToPass())
                .duration(courseRequest.getDuration())
                .credit(courseRequest.getCredit())
                .isFinished(false)
                .institutionID(module.getInstitutionID())
                .moduleID(courseRequest.getModuleID())
                .courseParts(courseRequest.getCourseParts())
                .build();
        courseRepository.save(course);
        addCourseToModule(module, course.getId());
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<HttpStatus> updateCourse(String id, CourseRequest courseRequest) {
        log.info("Updating course info :" + courseRequest);
        if(courseRequest.getName() == null || courseRequest.getDescription() == null) {
            throw new RequestNotValidException("Course name and description are required");
        }
        if(courseRepository.existsByNameAndModuleID(courseRequest.getName(), courseRequest.getModuleID())) {
            throw new CourseAlreadyExistsException("Course with name " + courseRequest.getName() + " already exists");
        }
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        course.setName(courseRequest.getName());
        course.setSemester(courseRequest.getSemester() != null ? Semester.valueOf(courseRequest.getSemester()) : null);
        course.setSkills(courseRequest.getSkills());
        course.setScoreToPass(courseRequest.getScoreToPass() != null ? courseRequest.getScoreToPass() : 0.0);
        course.setDuration(courseRequest.getDuration());
        course.setDescription(courseRequest.getDescription());
        course.setIsFinished(courseRequest.getIsFinished());
        course.setCredit(courseRequest.getCredit());
        course.setCourseParts(courseRequest.getCourseParts());
        courseRepository.save(course);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteCourse(String id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        Module module = moduleRepository.findById(course.getModuleID()).orElseThrow(() -> new ModuleNotFoundException("Module not found"));
        removeCourseFromModule(module, id);
        deleteCourseClassrooms(id);
        courseRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private void deleteCourseClassrooms(String id) {
        classRoomRepository.deleteAllByCourse(id);
    }

    @Override
    public ResponseEntity<PaginatedCoursesResponse> getCoursesByProgram(int page, int size, String moduleID, String keyword) {
        log.info("Getting courses by module");
        log.info("Page: " + page + " Size: " + size + " ModuleID: " + moduleID + " Keyword: " + keyword);
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> modulePage;
        modulePage = courseRepository.searchAllByModuleIDAndName(moduleID, keyword, pageable);
        log.info("Returning courses by module");
        return new ResponseEntity<>(PaginatedCoursesResponse.builder()
                .courses(modulePage.getContent().stream().map(
                        module -> CourseResponse.builder()
                                .id(module.getId())
                                .name(module.getName())
                                .description(module.getDescription())
                                .semester(module.getSemester()!=null?module.getSemester().name():null)
                                .assessments(module.getAssessments())
                                .scoreToPass(module.getScoreToPass())
                                .skills(module.getSkills())
                                .duration(module.getDuration())
                                .credit(module.getCredit())
                                .isFinished(module.getIsFinished())
                                .program(module.getProgram())
                                .institutionID(module.getInstitutionID())
                                .moduleID(module.getModuleID())
                                .courseParts(module.getCourseParts())
                                .build()
                ).toList())
                .totalPages(modulePage.getTotalPages())
                .totalItems(modulePage.getTotalElements())
                .currentPage(modulePage.getNumber())
                .build(), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<CourseResponse> getCourseById(String id) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        return new ResponseEntity<>(CourseResponse.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .semester(course.getSemester()!=null? course.getSemester().name():null)
                .skills(course.getSkills())
                .assessments(course.getAssessments())
                .scoreToPass(course.getScoreToPass())
                .duration(course.getDuration())
                .credit(course.getCredit())
                .isFinished(course.getIsFinished())
                .program(course.getProgram())
                .institutionID(course.getInstitutionID())
                .courseParts(course.getCourseParts())
                .build(), HttpStatus.OK);
    }

    @Override
    public void deleteAllProgramCourses(String programID) {
        Program program = programRepository.findById(programID).orElseThrow(() -> new ProgramNotFoundException("Program not found"));
        if (program.getCourses() != null) {
            program.getCourses().forEach(this::deleteCourse);
            program.setCourses(new ArrayList<>());
            programRepository.save(program);
        }
    }

    @Override
    public void addCourseToModule(Module module, String moduleID) {
        if(module.getCoursesID()==null)
        {
            module.setCoursesID(new ArrayList<>());
        }
        if(!module.getCoursesID().contains(moduleID))
        {
            module.getCoursesID().add(moduleID);
            moduleRepository.save(module);
        }
    }

    @Override
    public void removeCourseFromModule(Module module, String moduleID) {
        if (module.getCoursesID() != null && module.getCoursesID().contains(moduleID)) {
            module.getCoursesID().remove(moduleID);
            moduleRepository.save(module);
        }
    }

    @Override
    public void addModuleToCourse(String moduleID, String courseID) {
        Course course = courseRepository.findById(courseID).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        course.setModuleID(moduleID);
        courseRepository.save(course);
    }
    @Override

    public void removeModuleFromCourse(String moduleID, String courseID) {
        Course course = courseRepository.findById(courseID).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        course.setModuleID(null);
        courseRepository.save(course);
    }



    @Override
    public ResponseEntity<HttpStatus> createAssessment(String id,AssessmentRequest assessmentRequest) {
        log.info("Creating assessment");
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        if(course.getAssessments() == null) {
            course.setAssessments(new ArrayList<>());
        }
        if(course.getAssessments().stream().anyMatch(assessment -> assessment.getName().equals(assessmentRequest.getName()))) {
            log.info("Assessment already exists");
            throw new AssessmentAlreadyExistsException("Assessment with name " + assessmentRequest.getName() + " already exists");
        }
//        if(module.getAssessments().stream().mapToDouble(Assessment::getWeight).sum() + assessmentRequest.getWeight() > 1) {
//            log.info("Sum of assessment weights exceeds 100%");
//            throw new AssessmentSumExceedsOneException("Sum of assessment weights exceeds 100%");
//        }
        course.getAssessments().add(Assessment.builder()
                .name(assessmentRequest.getName())
                .weight(assessmentRequest.getWeight()/100)
                .build());
        courseRepository.save(course);
        log.info("Assessment created");
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteAssessment(String id, String assessmentName) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        if(course.getAssessments() == null || course.getAssessments().stream().noneMatch(assessment -> assessment.getName().equals(assessmentName))) {
            throw new AssessmentNotFoundException("Assessment not found");
        }
        course.getAssessments().removeIf(assessment -> assessment.getName().equals(assessmentName));
        courseRepository.save(course);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> updateAssessment(String id, AssessmentRequest assessmentRequest) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new CourseNotFoundException("Course not found"));
        if(course.getAssessments() == null || course.getAssessments().stream().noneMatch(assessment -> assessment.getName().equals(assessmentRequest.getOldName()))) {
            throw new AssessmentNotFoundException("Assessment not found");
        }
//        double currentTotalWeight = module.getAssessments().stream().mapToDouble(Assessment::getWeight).sum();
//        double oldWeight = module.getAssessments().stream()
//                .filter(assessment -> assessment.getName().equals(assessmentRequest.getOldName()))
//                .mapToDouble(Assessment::getWeight)
//                .findFirst()
//                .orElse(0.0);
//        if(currentTotalWeight - oldWeight + assessmentRequest.getWeight() > 1) {
//            throw new AssessmentSumExceedsOneException("Sum of assessment weights exceeds 100%");
//        }
        course.getAssessments().removeIf(assessment -> assessment.getName().equals(assessmentRequest.getOldName()));
        course.getAssessments().add(Assessment.builder()
                .name(assessmentRequest.getName())
                .weight(assessmentRequest.getWeight()/100)
                .build());
        courseRepository.save(course);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
