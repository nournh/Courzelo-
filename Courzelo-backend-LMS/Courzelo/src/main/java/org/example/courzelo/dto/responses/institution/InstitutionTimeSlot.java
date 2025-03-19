package org.example.courzelo.dto.responses.institution;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InstitutionTimeSlot {
    private String dayOfWeek;       // e.g., "Monday"
    private String startTime; // e.g., "09:00 AM"
    private String endTime;// e.g., "11:00 AM"
}
