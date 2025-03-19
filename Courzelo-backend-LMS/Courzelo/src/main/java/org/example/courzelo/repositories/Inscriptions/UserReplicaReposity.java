package org.example.courzelo.repositories.Inscriptions;

import org.example.courzelo.models.Inscriptions.UserReplica;
import org.example.courzelo.models.institution.Institution;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserReplicaReposity extends MongoRepository<UserReplica,String> {
    List <UserReplica> findUserReplicaByEmail(String email);
    List<UserReplica> findUserReplicaByInstitution(Institution institution);
}
