package org.example.courzelo.repositories.Timetable;

import org.example.courzelo.models.Timetable.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimetableRepo extends MongoRepository<Timetable, String> {
}
