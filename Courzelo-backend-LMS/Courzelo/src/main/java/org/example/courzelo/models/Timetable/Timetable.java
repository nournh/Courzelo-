package org.example.courzelo.models.Timetable;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Group;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.DayOfWeek;
import java.util.List;
@Data

@Document(collection = "timetables")
public class Timetable {
    private String id;
    private String name;
    private Integer nmbrHours;
    private DayOfWeek dayOfWeek;
    private String period;
    private String institutionID;
    private List<String> students;
    private List<Semester> semesters;
    private List<String> courses;
    @DBRef
    private Group group;
    @DBRef
    private User teacher;
    public Timetable(String name, Integer nmbrHours, DayOfWeek dayOfWeek, String period, String institutionID, List<String> students, List<Semester> semesters, List<String> courses, Group group, User teacher) {
        this.name = name;
        this.nmbrHours = nmbrHours;
        this.dayOfWeek = dayOfWeek;
        this.period = period;
        this.institutionID = institutionID;
        this.students = students;
        this.semesters = semesters;
        this.courses = courses;
        this.group = group;
        this.teacher = teacher;
    }

    public Timetable() {

    }
}
