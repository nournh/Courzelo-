package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;
import org.example.courzelo.models.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@Document(collection = "invitations")
public class Invitation {
    @Id
    private String id;
    private String institutionID;
    private String code;
    private List<String> skills;
    private String email;
    private Role role;
    private LocalDateTime expiryDate;
    private InvitationStatus status;
}
