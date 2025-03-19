package org.example.courzelo.services.Timetable;

import jakarta.persistence.EntityNotFoundException;
import org.example.courzelo.GAlgo.GAlgorithm;
import org.example.courzelo.GAlgo.UniversityTimetable;
import org.example.courzelo.dto.Timetable.TimetableDTO;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.models.Timetable.ElementModule;
import org.example.courzelo.models.Timetable.Period;
import org.example.courzelo.models.Timetable.Semester;
import org.example.courzelo.models.Timetable.Timetable;
import org.example.courzelo.models.User;
import org.example.courzelo.repositories.Timetable.ElementModuleRepo;
import org.example.courzelo.repositories.Timetable.TimetableRepo;
import org.example.courzelo.serviceImpls.UserServiceImpl;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.util.*;
import java.util.logging.Logger;

@Service
public class TimetableeService {
    private final DataFromDB dataFromDb;
    private final ElementModuleRepo elementModuleRepo;
    private final TimetableRepo timetableRepo;
    private ElementModuleService elementModuleService;
    private UserServiceImpl userService;

    private Map<DayOfWeek, Map<Period, String>> schedule;

    public TimetableeService(DataFromDB dataFromDb, ElementModuleRepo elementModuleRepo, TimetableRepo timetableRepo, ElementModuleService elementModuleService, UserServiceImpl userService, Map<DayOfWeek, Map<Period, String>> schedule) {
        this.dataFromDb = dataFromDb;
        this.elementModuleRepo = elementModuleRepo;
        this.timetableRepo = timetableRepo;
        this.elementModuleService = elementModuleService;
        this.userService = userService;
        this.schedule = schedule;
    }


    public long countTimetables() {
        return elementModuleRepo.count();
    }


    public List<Map<String, List<ElementModule>>> generateTimetable() {
        List<ElementModule> elementModules = elementModuleRepo.findAll();

        return new ArrayList<>();
    }


    public List<Map<String, List<ElementModule>>> getAllEmplois() {
        List<Map<String, List<ElementModule>>> emplois = new ArrayList<>();
        dataFromDb.loadDataFromDatabase();
        // Retrieve all classes
        List<GroupResponse> classes = DataFromDB.groups;
        for (GroupResponse classe : classes) {
            Map<String, List<ElementModule>> emploi = new HashMap<>();
            emploi.put(classe.getId(), elementModuleService.getEmploisByClasse(classe.getId()));
            emplois.add(emploi);
        }
        return emplois;
    }

    public List<ElementModule> getEmploisByClasse(String id) {
        return elementModuleService.getEmploisByClasse(id);
    }

    public List<Map<String, List<ElementModule>>> generateEmplois() {
        Logger logger = Logger.getLogger(TimetableeService.class.getName());
        List<Map<String, List<ElementModule>>> emplois = new ArrayList<>();
        dataFromDb.loadDataFromDatabase();
        GAlgorithm algorithm = new GAlgorithm();
        UniversityTimetable universityTimetable = algorithm.generateTimetable();

        for (int i = 0; i < universityTimetable.getNumberOfClasses(); i++) {
            if (!universityTimetable.getGroups().isEmpty() && i < universityTimetable.getGroups().size()) {
                Map<String, List<ElementModule>> emploi = new HashMap<>();
                emploi.put(universityTimetable.getGroups().get(i).getId(), universityTimetable.getTimetable(i));
                emplois.add(emploi);
            }
        }

        for (ElementModule elementDeModule : universityTimetable.getAllElements()) {
            elementModuleService.addElementModule(elementDeModule);
        }

        return emplois;
    }

    public List<ElementModule> getEmploiByProf(String id) {

        User teacher = userService.getProfById(id);
        // show only  element de module of S1 ou S3 or S5

        List<ElementModule> elementModules = new ArrayList<>();
        for (ElementModule elementModule : teacher.getEducation().getElementModules()) {
            if (elementModule.getClassRoom().getGroup().equals(Semester.S3.name()) ||
                    elementModule.getClassRoom().getGroup().equals(Semester.S5.name()) ||
                    elementModule.getClassRoom().getGroup().equals(Semester.S1.name())) {
                elementModules.add(elementModule);
            }
        }

        return elementModules;
    }


    public String create(final TimetableDTO timetableDTO) {
        final Timetable timeTable = new Timetable();
        mapToEntity(timetableDTO, timeTable);
        return timetableRepo.save(timeTable).getId();
    }

    private Timetable mapToEntity(final TimetableDTO timeTableDTO,
                                  final Timetable timeTable) {
        timeTable.setName(timeTableDTO.getName());
        timeTable.setGroup(timeTableDTO.getGroup());
        timeTable.setCourses(timeTableDTO.getCourses());
        timeTable.setDayOfWeek(timeTableDTO.getDayOfWeek());
        timeTable.setNmbrHours(timeTableDTO.getNmbrHours());
        timeTable.setPeriod(String.valueOf(timeTableDTO.getPeriod()));
        timeTable.setTeacher(timeTableDTO.getTeacher());
        timeTable.setStudents(timeTableDTO.getStudents());
        timeTable.setSemesters(timeTableDTO.getSemesters());
        return timeTable;
    }

    private TimetableDTO mapToDTO(final Timetable timeTable,
                                  final TimetableDTO timeTableDTO) {
        timeTableDTO.setId(timeTable.getId());
        timeTableDTO.setName(timeTable.getName());
        timeTableDTO.setGroup(timeTable.getGroup());
        timeTableDTO.setCourses(timeTable.getCourses());
        timeTableDTO.setDayOfWeek(timeTable.getDayOfWeek());
        timeTableDTO.setNmbrHours(timeTable.getNmbrHours());
        timeTableDTO.setPeriod(Period.valueOf(timeTable.getPeriod()));
        timeTableDTO.setTeacher(timeTable.getTeacher());
        timeTableDTO.setStudents(timeTable.getStudents());
        timeTableDTO.setSemesters(timeTable.getSemesters());
        return timeTableDTO;
    }

    public TimetableDTO getById(String id) {
        Optional<Timetable> optionalTimetable = timetableRepo.findById(id);
        if (optionalTimetable.isPresent()) {
            Timetable timeTable = optionalTimetable.get();
            return mapToDTO(timeTable, new TimetableDTO());
        } else {
            throw new EntityNotFoundException("Timetable not found with ID: " + id);
        }
    }

    public void update(String id, TimetableDTO timetableDTO) {
        Optional<Timetable> optionalTimetable = timetableRepo.findById(id);

        if (optionalTimetable.isPresent()) {
            Timetable existingTimeTable = optionalTimetable.get();
            Timetable updatedTimeTable = mapToEntity(timetableDTO, existingTimeTable);
            timetableRepo.save(updatedTimeTable);
        } else {
            throw new EntityNotFoundException("Timetable not found with ID: " + id);
        }
    }

    public void delete(String id) {
        Optional<Timetable> optionalTimetable = timetableRepo.findById(id);

        if (optionalTimetable.isPresent()) {
            Timetable existingTimeTable = optionalTimetable.get();
            timetableRepo.delete(existingTimeTable);
        } else {
            throw new EntityNotFoundException("Timetable not found with ID: " + id);
        }
    }
}
