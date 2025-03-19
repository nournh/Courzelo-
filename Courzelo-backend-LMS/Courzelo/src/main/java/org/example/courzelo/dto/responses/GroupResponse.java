package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.dto.responses.institution.SimplifiedClassRoomResponse;
import org.example.courzelo.models.Timetable.Semester;

import java.util.List;

@Data
@Builder
public class GroupResponse {
    private String id;
    private String name;
    private String institutionID;
    private List<String> students;
    private String program;
    private List<SimplifiedClassRoomResponse> classrooms;
    private List<Semester>semesters;
}
