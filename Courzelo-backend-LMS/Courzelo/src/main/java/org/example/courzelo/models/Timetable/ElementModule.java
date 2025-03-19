package org.example.courzelo.models.Timetable;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.DayOfWeek;
import java.util.List;
@Data
@Builder
@Document(collection = "elementModules")
public class ElementModule {
    @Id
    private String id;
    private Integer nmbrHours;
    private String name;
    private DayOfWeek dayOfWeek;
    private Period period;
    private List<Semester> semesters;
    private String teacherID;
    private String institutionID;
    private List<String> students;
    @DBRef
    private ClassRoom classRoom;
    @DBRef
    private Group group;
    @DBRef
    private User teacher;

}
