package org.example.courzelo.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvitationResponse {
    private String id;
    private String email;
    private String code;
    private List<String> skills;
    private String status;
    private String role;
    private LocalDateTime expiryDate;
}
