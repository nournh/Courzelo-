package org.example.courzelo.dto.Timetable;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.example.courzelo.models.Timetable.Period;
import org.example.courzelo.models.Timetable.Semester;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Group;
import org.springframework.data.mongodb.core.mapping.DBRef;


import java.time.DayOfWeek;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class TimetableDTO {
    private String id;
    private Integer nmbrHours;
    private String name;
    private DayOfWeek dayOfWeek;
    private Period period;
    private Group group;
    private List<Semester> semesters;
    private String className;
    private String courseName;
    private String professorId;
    private String institutionID;
    private List<String> students;
    private List<String> courses;
    private User teacher;
}
