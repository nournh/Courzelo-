package org.example.courzelo.serviceImpls;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.responses.institution.InstitutionTimeSlotsConfiguration;
import org.example.courzelo.dto.responses.institution.TimetableResponse;
import org.example.courzelo.exceptions.ClassRoomNotFoundException;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.models.institution.Timeslot;
import org.example.courzelo.repositories.ClassRoomRepository;
import org.example.courzelo.repositories.GroupRepository;
import org.example.courzelo.repositories.InstitutionRepository;
import org.example.courzelo.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class TimetableGenerationService {
    private final ClassRoomRepository classRoomRepository;

    private final InstitutionRepository institutionRepository;

    private final TimetableService timetableService;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;


    public ResponseEntity<HttpStatus> generateWeeklyTimetable(String institutionID) {
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(()-> new ClassRoomNotFoundException("Institution not found"));
        timetableService.getGroupTimetables().clear();
        timetableService.getTeacherTimetables().clear();
        timetableService.setInstitutionTimeSlotsConfiguration(InstitutionTimeSlotsConfiguration.builder()
                .days(institution.getTimeSlotsDays())
                .timeSlots(institution.getTimeSlots())
                .build());
        timetableService.initializeTimeslots();
        List<ClassRoom> cours = classRoomRepository.findAllByInstitutionID(institutionID)
                .orElseThrow(()-> new ClassRoomNotFoundException("No courses found for institution"));

        // Generate timetable using the Greedy algorithm
        timetableService.generateTimetable(cours,institutionID);

        // Save or display timetables
        Map<String, List<Timeslot>> groupTimetables = timetableService.getGroupTimetables();
        Map<String, List<Timeslot>> teacherTimetables = timetableService.getTeacherTimetables();
        institution.setGroupTimetables(groupTimetables);
        institution.setTeacherTimetables(teacherTimetables);
        institution.setTimetableWeek(getClosestMonday());
        institutionRepository.save(institution);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    public Date getClosestMonday() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());

        // Adjust to the closest Monday
        int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
        int daysUntilMonday = (Calendar.MONDAY - dayOfWeek + 7) % 7;
        calendar.add(Calendar.DAY_OF_YEAR, daysUntilMonday);

        // Set time to the start of the day
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        return calendar.getTime();
    }
    public ResponseEntity<TimetableResponse> getTimetable(@NotNull String institutionID, Principal principal) {
        Institution institution = institutionRepository.findById(institutionID)
                .orElseThrow(() -> new ClassRoomNotFoundException("Institution not found"));
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ClassRoomNotFoundException("User not found"));
        Map<String, List<Timeslot>> groupTimetables = null;
        Map<String, List<Timeslot>> teacherTimetables = null;

        if (user.getRoles().contains(Role.ADMIN)) {
            groupTimetables = institution.getGroupTimetables();
            teacherTimetables = institution.getTeacherTimetables();
        } else if (user.getRoles().contains(Role.TEACHER)) {
            String teacherFullName = user.getProfile().getName() + " " + user.getProfile().getLastname();
            teacherTimetables = institution.getTeacherTimetables().entrySet().stream()
                    .filter(entry -> entry.getKey().equals(teacherFullName))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        }else if(user.getRoles().contains(Role.STUDENT)) {
            if(user.getEducation().getGroupID()!= null) {
                Group group = groupRepository.findById(user.getEducation().getGroupID())
                        .orElseThrow(() -> new ClassRoomNotFoundException("Group not found"));
                groupTimetables = institution.getGroupTimetables().entrySet().stream()
                        .filter(entry -> entry.getKey().equals(group.getName()))
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
            }
        }
        Date timetableWeek = institution.getTimetableWeek();
        log.info("Timetable week: {}", timetableWeek);
        log.info("Group timetables: {}", groupTimetables);
        log.info("Teacher timetables: {}", teacherTimetables);
        return new ResponseEntity<>(new TimetableResponse(groupTimetables, teacherTimetables, timetableWeek), HttpStatus.OK);
    }
}

