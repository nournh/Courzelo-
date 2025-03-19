package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    boolean existsByNameAndProgram(String name, String programID);
    boolean existsByNameAndModuleID(String name, String moduleID);
    Page<Course> findAllByProgram(String programID, Pageable pageable);
    Page<Course> findAllByProgramAndNameContainingIgnoreCase(String programID, String keyword, Pageable pageable);
    @Query("{ 'moduleID' : ?0, 'name': { $regex: '.*?1.*', $options: 'i' } }")
    Page<Course> searchAllByModuleIDAndName(String moduleID, String keyword, Pageable pageable);
    @Query(value = "{ 'program' : :#{#programID} }", fields = "{ 'credit' : 1 }")
    Optional<List<Course>> findCreditsByProgram(@Param("programID") String programID);
}
