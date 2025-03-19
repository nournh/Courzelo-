package org.example.courzelo.dto.requests.program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProgramRequest {
    private String name;
    private String description;
    private Integer credits;
    private String duration;
}
