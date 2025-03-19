package org.example.courzelo.repositories;

import org.bson.types.Code;
import org.example.courzelo.models.CodeType;
import org.example.courzelo.models.CodeVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface CodeVerificationRepository extends MongoRepository<CodeVerification, String> {
    void deleteByEmailAndCodeType(String email, CodeType codeType);
    void deleteAllByExpiryDateBefore(Instant expiryDate);
    CodeVerification findByCode(String code);
    Optional<CodeVerification> findByEmailAndInstitutionID(String email, String institutionID);


}
