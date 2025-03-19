package org.example.courzelo.dto.responses.institution;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.models.Timetable.ElementModule;

import java.util.List;

@Data
@Builder
public class SimplifiedClassRoomResponse {
    private String classroomID;
    private String classroomName;
    private String teacher;
    private String course;
    private List<ElementModule> elementModules;


}
