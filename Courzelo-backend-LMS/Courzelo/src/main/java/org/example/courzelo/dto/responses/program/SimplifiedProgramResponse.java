package org.example.courzelo.dto.responses.program;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimplifiedProgramResponse {
    private String id;
    private String name;
}
