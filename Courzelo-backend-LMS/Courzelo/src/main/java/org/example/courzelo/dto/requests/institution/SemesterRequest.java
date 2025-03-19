package org.example.courzelo.dto.requests.institution;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class SemesterRequest {
    Date firstSemesterStart;
    Date secondSemesterStart;
}
