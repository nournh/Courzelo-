package org.example.courzelo.dto.responses.institution;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.courzelo.models.institution.Timeslot;

import java.util.Date;
import java.util.List;
import java.util.Map;
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimetableResponse {
    private Map<String, List<Timeslot>> groupTimetables;
    private Map<String, List<Timeslot>> teacherTimetables;
    private Date timetableWeek;

}
