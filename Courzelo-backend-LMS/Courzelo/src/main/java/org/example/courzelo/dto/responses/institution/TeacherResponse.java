package org.example.courzelo.dto.responses.institution;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TeacherResponse {
    private String name;
    private String lastname;
    private String email;
    private List<String> skills;
}
