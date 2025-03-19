package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.Grade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends MongoRepository<Grade, String> {
    Optional<List<Grade>> findAllByGroupID(String groupID);
    Optional<List<Grade>> findAllByGroupIDAndCourseID(String groupID, String courseID);
    Optional<Grade> findByNameAndCourseIDAndStudentEmail(String name, String courseID, String studentEmail);
    Optional<List<Grade>> findByCourseIDAndStudentEmail( String courseID, String studentEmail);
    Optional<List<Grade>> findByStudentEmailAndGroupID(String email,String groupID);
}
