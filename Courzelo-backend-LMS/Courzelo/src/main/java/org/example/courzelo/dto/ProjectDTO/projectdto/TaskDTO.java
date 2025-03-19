package org.example.courzelo.dto.ProjectDTO.projectdto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private String id;
    private String name;
    private String status;
    private ProjectDTO project;
    private GroupProjectDTO groupProject;

}
