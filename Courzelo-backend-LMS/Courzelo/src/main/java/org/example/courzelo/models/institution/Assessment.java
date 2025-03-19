package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Assessment {
    private String name;
    private float weight;
}
