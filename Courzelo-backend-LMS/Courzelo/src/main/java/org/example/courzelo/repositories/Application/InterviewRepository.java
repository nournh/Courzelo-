package org.example.courzelo.repositories.Application;

import org.example.courzelo.models.Application.Interview;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Institution;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface InterviewRepository extends MongoRepository<Interview,String> {
    List<Interview> findByInterviewer(User interviewer);
    List<Interview> findByInterviewerAndInstitution(User interviewer, Institution institution);
}
