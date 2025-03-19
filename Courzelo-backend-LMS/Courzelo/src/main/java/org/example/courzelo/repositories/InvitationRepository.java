package org.example.courzelo.repositories;

import org.example.courzelo.models.Status;
import org.example.courzelo.models.institution.Invitation;
import org.example.courzelo.models.institution.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    void deleteAllByExpiryDateBefore(LocalDateTime now);
    @Query("{ 'institutionID': ?0, $or: [ { 'email': { $regex: ?1, $options: 'i' } }, { 'role': { $regex: ?1, $options: 'i' } } , { 'status': { $regex: ?1, $options: 'i' } }, { 'expiryDate': { $regex: ?1, $options: 'i' } }  ] }")
    Page<Invitation> findByInstitutionIDAndKeyword(String institutionID, String keyword, Pageable pageable);
    Page<Invitation> findByInstitutionID(String institutionID, Pageable pageable);
    Optional<Invitation> findByEmailAndInstitutionID(String email, String institutionID);
    boolean existsByEmailAndInstitutionID(String email, String institutionID);
    Optional<List<Invitation>> findAllByStatusAndExpiryDateBefore(InvitationStatus status, LocalDateTime now);
}
