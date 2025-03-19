package org.example.courzelo.repositories.Forum;

import org.example.courzelo.models.Forum.ForumThread;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ThreadRepository extends MongoRepository<ForumThread, String> {
    Optional<List<ForumThread>> findAllByInstitutionID(String institutionID);
}
