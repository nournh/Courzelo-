package org.example.courzelo.serviceImpls;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.responses.institution.InstitutionTimeSlot;
import org.example.courzelo.dto.responses.institution.InstitutionTimeSlotsConfiguration;
import org.example.courzelo.exceptions.*;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;
import org.example.courzelo.models.institution.Timeslot;
import org.example.courzelo.repositories.GroupRepository;
import org.example.courzelo.repositories.CourseRepository;
import org.example.courzelo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
@Service
@Slf4j
public class TimetableService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private GroupRepository groupRepository;
    private List<Timeslot> availableTimeslots;
    // Getter methods for the generated timetables
    @Getter
    private Map<String, List<Timeslot>> groupTimetables; // groupId -> List of timeslots assigned
    @Getter
    private Map<String, List<Timeslot>> teacherTimetables;
    @Setter// teacherId -> List of timeslots assigned
    private InstitutionTimeSlotsConfiguration institutionTimeSlotsConfiguration;
    public TimetableService() {
        groupTimetables = new HashMap<>();
        teacherTimetables = new HashMap<>();
    }

    // Initialize available timeslots for the week (example times)
    public void initializeTimeslots() {
        log.info("Initializing available timeslots");
        availableTimeslots = new ArrayList<>();
        String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        if (this.institutionTimeSlotsConfiguration != null) {
            log.info("Using institution time slots configuration");
            daysOfWeek = this.institutionTimeSlotsConfiguration.getDays().toArray(new String[0]);
        }
        String[] timeSlots = {"09:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00"};
        if (this.institutionTimeSlotsConfiguration != null) {
            log.info("Using institution time slots configuration");
            timeSlots = this.institutionTimeSlotsConfiguration.getTimeSlotsAsArray();
        }

        for (String day : daysOfWeek) {
            for (String slot : timeSlots) {
                String[] times = slot.split("-");
                availableTimeslots.add(new Timeslot(day, times[0], times[1]));
            }
        }
        log.info("Available timeslots: " + availableTimeslots);
    }
    // Fetch all groups by institution and initialize groupTimetables
    public void initializeGroupTimetables(String institutionId) {
        List<Group> groups = groupRepository.findByInstitutionID(institutionId).orElseThrow(()-> new InstitutionNotFoundException("Institution doesn't exist"));
        for (Group group : groups) {
            groupTimetables.put(group.getName(), new ArrayList<>());
        }
    }
    // Generate the timetable for all groups and teachers
// Assign a timeslot for each course, prioritizing teacher availability if provided
    public void generateTimetable(List<ClassRoom> cours, String institutionID) {
        initializeGroupTimetables(institutionID);

        // Sort courses based on teacher availability, group, etc.
        cours.sort(Comparator.comparing(ClassRoom::getTeacher).thenComparing(ClassRoom::getGroup));

        // Iterate over each course and try to assign a suitable timeslot
        for (ClassRoom classRoom : cours) {
            Timeslot assignedSlot = assignGreedyTimeslot(classRoom);

            if (assignedSlot != null) {
                // Add the assigned timeslot to the group's and teacher's timetable
                log.info("Assigning timeslot: " + assignedSlot);
                addTimeslotToGroupAndTeacher(classRoom, assignedSlot);
            } else {
                log.info("No available timeslot for course: " + classRoom.getId());
                throw new NoTimeslotAvailableException("No available timeslot , please add more timeslots");
            }
        }
        log.info("Timetable generation complete");
    }

    // Assign a free timeslot using a greedy approach, respecting teacher availability
    private Timeslot assignGreedyTimeslot(ClassRoom classRoom) {
        Timeslot bestSlot = null;
        int bestScore = Integer.MIN_VALUE;

        for (Timeslot slot : availableTimeslots) {
            Group group = groupRepository.findById(classRoom.getGroup()).orElseThrow(() -> new GroupNotFoundException("Group not found"));
            User teacher = null;
            if(classRoom.getTeacher()!=null){
                teacher = userRepository.findByEmail(classRoom.getTeacher()).orElseThrow(() -> new UserNotFoundException("Teacher not found"));
            }
            String teacherFullName = teacher != null ? teacher.getProfile().getName()+" "+teacher.getProfile().getLastname() : "Teacher not assigned";
            if (isAvailableForGroup(group.getName(), slot) && isAvailableForTeacher(teacherFullName, slot)) {
                log.info("Found available timeslot: " + slot);
                log.info("teacher timetable: " + teacherTimetables);
                // Calculate the score for this timeslot
                int score = scoreTimeslot(classRoom, slot,teacher);

                // Pick the timeslot with the highest score
                if (score > bestScore) {
                    log.info("Found better timeslot: " + slot + " with score: " + score);
                    bestScore = score;
                    bestSlot = new Timeslot(slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime());
                }
            }
        }
        return bestSlot;
    }


    // Add assigned timeslot to group and teacher timetables
    private void addTimeslotToGroupAndTeacher(ClassRoom classRoom, Timeslot assignedSlot) {
       Group group =  groupRepository.findById(classRoom.getGroup()).orElseThrow(() -> new GroupNotFoundException("Group not found"));
        String teacherFullName = null;
        if (classRoom.getTeacher() != null) {
            log.info("Teacher assigned: " + classRoom.getTeacher());
            User teacher = userRepository.findByEmail(classRoom.getTeacher()).orElseThrow(() -> new UserNotFoundException("Teacher not found"));
            teacherFullName = teacher.getProfile().getName()+" "+teacher.getProfile().getLastname();
        }

        assignedSlot.setGroup(group.getName());
        assignedSlot.setModule(courseRepository.findById(classRoom.getCourse()).orElseThrow(() -> new CourseNotFoundException("Module not found")).getName());
        assignedSlot.setTeacher(teacherFullName != null ? teacherFullName : "Teacher not assigned");

        groupTimetables.computeIfAbsent(group.getName(), k -> new ArrayList<>()).add(assignedSlot);

        if (teacherFullName != null) {
            teacherTimetables.computeIfAbsent(teacherFullName, k -> new ArrayList<>()).add(assignedSlot);
        }
    }

    // Simple heuristic to prioritize teacher availability (you could make this more sophisticated)

    private int scoreTimeslot(ClassRoom classRoom, Timeslot slot, User teacher) {
        int score = 0;
        // Example heuristic: prioritize teacher's preferred timeslots (disponibilitySlots)
        if (teacher != null && isSlotInTeacherDisponibility(teacher, slot)) {
            score += 10; // Prefer timeslots that fit teacher's availability
        } else {
            score -= 10; // Penalize timeslots outside the teacher's availability
        }

        // Add more rules here as needed
        return score;
    }
    // Check if the group is available for the timeslot
    private boolean isAvailableForGroup(String groupName, Timeslot slot) {
        log.info("Checking if group: " + groupName + " is available for timeslot: " + slot);
        return groupTimetables.get(groupName).stream()
                .noneMatch(existingSlot -> existingSlot.getDayOfWeek().equals(slot.getDayOfWeek()) &&
                        existingSlot.getStartTime().equals(slot.getStartTime()) &&
                        existingSlot.getEndTime().equals(slot.getEndTime()));
    }

    // Check if the teacher is available for the timeslot
    private boolean isAvailableForTeacher(String teacherEmail, Timeslot slot) {
        log.info("Checking if teacher: " + teacherEmail + " is available for timeslot: " + slot);
        return teacherEmail == null || teacherEmail.equals("Teacher not assigned") ||
                !teacherTimetables.containsKey(teacherEmail) ||
                teacherTimetables.get(teacherEmail).stream()
                        .noneMatch(existingSlot -> existingSlot.getDayOfWeek().equals(slot.getDayOfWeek()) &&
                                existingSlot.getStartTime().equals(slot.getStartTime()) &&
                                existingSlot.getEndTime().equals(slot.getEndTime()));
    }
    private boolean isSlotInTeacherDisponibility(User teacher, Timeslot slot) {
        if (teacher.getEducation() != null && teacher.getEducation().getDisponibilitySlots() != null) {
            List<InstitutionTimeSlot> disponibilitySlots = teacher.getEducation().getDisponibilitySlots();
            return disponibilitySlots.stream().anyMatch(availableSlot ->
                    availableSlot.getDayOfWeek().equals(slot.getDayOfWeek()) &&
                            availableSlot.getStartTime().equals(slot.getStartTime()) &&
                            availableSlot.getEndTime().equals(slot.getEndTime()));
        }else {
            return true;
        }
    }

}

