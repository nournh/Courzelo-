package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.Module;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleRepository extends MongoRepository<Module,String> {
    boolean existsByNameAndProgramID(String name, String programID);
    void deleteAllByProgramID(String programID);
    void deleteAllByInstitutionID(String institutionID);
    @Query("{ 'programID': ?0, 'name': { $regex: '.*?1.*', $options: 'i' } }")
    Page<Module> searchByProgramIDAndName(String programID, String name, Pageable page);
    @Query("{ 'institutionID': ?0, 'name': { $regex: '.*?1.*', $options: 'i' } }")
    Page<Module> searchByInstitutionIDAndName(String institutionID, String name, Pageable page);
}
