package org.example.courzelo.dto.Timetable;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.example.courzelo.models.Timetable.Period;
import org.example.courzelo.models.Timetable.Semester;

import java.time.DayOfWeek;
import java.util.List;
@Data
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ElementModuleDTO {
    private String id;
    private Integer nmbrHours;
    private String name;
    private DayOfWeek dayOfWeek;
    private Period period;
    private List<Semester> semesters;
    private String teacher;
    private List<String> students;
    private String group;
    private String institutionID;
    private String course;
}
