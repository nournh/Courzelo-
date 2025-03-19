package org.example.courzelo.dto.responses.program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProgramResponse {
    private String id;
    private String name;
    private String description;
    private Integer credits;
    private String duration;
    private String institutionID;
    private boolean hasCalendar;

}
