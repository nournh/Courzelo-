package org.example.courzelo.models.Inscriptions;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.Data;
import org.example.courzelo.models.institution.Institution;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document
public class UserReplica {
    @Id
    private String id;
    private String email;
    private String name;
    private String lastname;
    private LocalDate birthDate;
    private String gender;
    private String country;
    private String password;
    private double note;
    @DBRef
    private Institution institution;

    @Enumerated(EnumType.STRING)
    private Status status;
}
