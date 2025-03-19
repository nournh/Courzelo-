package org.example.courzelo.dto.responses.institution;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InvitationsResultResponse {
    private List<String> emailsAlreadyAccepted;
    private List<String> emailsNotFound;
}
