package org.example.courzelo.repositories;

import org.example.courzelo.dto.responses.UserResponse;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findUserByEmail(String email);
    Optional<User> findByEmail(String s);
    boolean existsByEmail(String email);
    void deleteByEmail(String email);
User findUserById(String id);
    List<User> findUsersByRoles(List<Role> roles);
}
