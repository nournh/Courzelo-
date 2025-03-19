package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ProgramRepository extends MongoRepository<Program, String> {
    boolean existsByNameAndInstitutionID(String name, String institutionID);
    Page<Program> findAllByInstitutionID(String institutionID, Pageable pageable);
    Page<Program> findAllByInstitutionIDAndNameContainingIgnoreCase(String institutionID, String keyword, Pageable pageable);
    Optional<List<Program>> findAllByInstitutionID(String institutionID);


}
