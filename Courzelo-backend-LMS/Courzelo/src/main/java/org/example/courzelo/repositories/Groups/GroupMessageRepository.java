package org.example.courzelo.repositories.Groups;

import org.example.courzelo.models.GroupChat.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface GroupMessageRepository extends MongoRepository<Group, String> {
    @Query("{ 'members': ?0 }")
    List<Group> findByMembersEmail(String email);
}
