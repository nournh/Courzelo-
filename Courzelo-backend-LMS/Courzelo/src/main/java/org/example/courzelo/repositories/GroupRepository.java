package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface GroupRepository extends MongoRepository<Group,String> {
    Page<Group> findByInstitutionID(String institutionID, Pageable pageable);
    Page<Group> findByInstitutionIDAndNameContainingIgnoreCase(String institutionID, String keyword, Pageable pageable);
    Optional<List<Group>> findByInstitutionID(String institutionID);
    Optional<List<Group>> findByProgram(String program);
}
