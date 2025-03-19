package org.example.courzelo.dto.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupRequest {
    private String name;
    private String institutionID;
    private List<String> students;
    private String program;
    private List<String> courses;
}
