package org.example.courzelo.services.Timetable;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.Timetable.ElementModuleDTO;
import org.example.courzelo.dto.responses.ClassRoomResponse;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.models.User;
import org.example.courzelo.serviceImpls.ClassRoomServiceImpl;
import org.example.courzelo.serviceImpls.GroupServiceImpl;
import org.example.courzelo.serviceImpls.InstitutionServiceImpl;
import org.example.courzelo.serviceImpls.UserServiceImpl;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class DataFromDB {
    private final ElementModuleService elementModuleService;
    private final ClassRoomServiceImpl courseService;
    private final GroupServiceImpl groupService;
    private final UserServiceImpl professorService;
    private final InstitutionServiceImpl institutionService;
    public static List<ElementModuleDTO> elementModules;
    public static List<User> professors;
    public static List<ClassRoomResponse> courses;
    public static List<GroupResponse> groups;
    public void loadDataFromDatabase() {
        //elementModules = elementModuleService.getAllElementModules();
        professors = elementModuleService.getProfsByRole();
        courses = courseService.findAll();
        groups = elementModuleService.getClasses();
    }
}
