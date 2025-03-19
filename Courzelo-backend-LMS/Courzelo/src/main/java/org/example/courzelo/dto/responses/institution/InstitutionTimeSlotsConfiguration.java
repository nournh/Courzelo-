package org.example.courzelo.dto.responses.institution;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class InstitutionTimeSlotsConfiguration {
    private List<String> days;
    private List<InstitutionTimeSlot> timeSlots;
    public String[] getTimeSlotsAsArray() {
        return timeSlots.stream()
                .map(slot -> slot.getStartTime() + "-" + slot.getEndTime())
                .toArray(String[]::new);
    }
}
