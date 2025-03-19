package org.example.courzelo.models.institution;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Timeslot {
    private String group;
    private String teacher;
    private String module;
    private String dayOfWeek; // e.g., "Monday", "Tuesday"
    private String startTime; // e.g., "09:00 AM"
    private String endTime;   // e.g., "11:00 AM"

    public Timeslot(String dayOfWeek, String startTime, String endTime) {
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Timeslot(String teacher, String module, String dayOfWeek, String startTime, String endTime) {
        this.teacher = teacher;
        this.module = module;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
