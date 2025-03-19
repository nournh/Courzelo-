package org.example.courzelo.repositories;

import org.example.courzelo.models.institution.ClassRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends MongoRepository<ClassRoom,String> {
    Optional<List<ClassRoom>> findAllByTeacher(String teacher);
    Optional<List<ClassRoom>> findAllByGroup(String group);
    Optional<List<ClassRoom>> findAllByInstitutionID(String institutionID);
    void deleteAllByCourse(String course);
    Boolean existsByCourseAndGroup(String course, String group);
}
