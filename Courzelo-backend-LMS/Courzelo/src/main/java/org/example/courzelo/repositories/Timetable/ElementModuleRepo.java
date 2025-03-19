package org.example.courzelo.repositories.Timetable;

import org.example.courzelo.dto.responses.UserResponse;
import org.example.courzelo.models.Timetable.ElementModule;
import org.example.courzelo.models.Timetable.Period;
import org.example.courzelo.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ElementModuleRepo extends MongoRepository<ElementModule, String> {


    List<ElementModule> findByDayOfWeekAndPeriodAndTeacher(DayOfWeek day, Period p, User teacher);

    List<ElementModule> findByDayOfWeekAndPeriodAndGroup(DayOfWeek day, Period p, String id);

    List<ElementModule> getElementModulesByGroup(String id);
}
