package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.responses.*;
import org.example.courzelo.exceptions.UserAlreadyHasRoleException;
import org.example.courzelo.exceptions.UserNotFoundException;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.services.ISuperAdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class SuperAdminServiceImpl implements ISuperAdminService {
   private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    @Override
    public ResponseEntity<PaginatedUsersResponse> getAllUsers(int page, int size, String keyword) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Query query = new Query().with(pageRequest);

        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria criteria = new Criteria().orOperator(
                    Criteria.where("_id").regex(keyword,"i"),
                    Criteria.where("email").regex(keyword, "i"),
                    Criteria.where("profile.lastname").regex(keyword, "i"),
                    Criteria.where("profile.name").regex(keyword, "i"),
                    Criteria.where("profile.title").regex(keyword, "i"),
                    Criteria.where("roles").regex(keyword, "i")

            );
            query.addCriteria(criteria);
        }

        List<User> users = mongoTemplate.find(query, User.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), User.class);

        List<UserResponse> userResponses = users.stream()
                .map(
                        user -> UserResponse.builder()
                                .id(user.getId())  // ✅ Add this line to include the ID
                                .email(user.getEmail())
                                .profile(new UserProfileResponse(user.getProfile()))
                                .roles(user.getRoles().stream().map(Role::name).toList())
                                .security(new UserSecurityResponse(user.getSecurity()))
                                .build()
                )

                .collect(Collectors.toList());

        PaginatedUsersResponse response = new PaginatedUsersResponse();
        response.setUsers(userResponses);
        response.setCurrentPage(page);
        response.setTotalPages((int) Math.ceil((double) total / size));
        response.setTotalItems(total);
        response.setItemsPerPage(size);

        return ResponseEntity.ok(response);
    }
    @Override
    public ResponseEntity<StatusMessageResponse> toggleUserBanStatus(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(new StatusMessageResponse("Error", "User not found"));
        }
        user.getSecurity().setBan(!user.getSecurity().getBan());
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("Success", user.getEmail()+" ban status toggled"));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> toggleUserEnabledStatus(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        user.getSecurity().setEnabled(!user.getSecurity().isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("Success", user.getEmail()+" enabled status toggled"));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> addRoleToUser(String email, String role) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        if(user.getRoles().contains(Role.valueOf(role))){
            throw new UserAlreadyHasRoleException("Role already assigned");
        }
        user.getRoles().add(Role.valueOf(role));
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("Success", email +" is now assigned role "+role));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> removeRoleFromUser(String email, String role) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        if(!user.getRoles().contains(Role.valueOf(role))){
            return ResponseEntity.badRequest().body(new StatusMessageResponse("Error", "Role not assigned"));
        }
        user.getRoles().remove(Role.valueOf(role));
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("Success", email +" is no longer assigned role "+role));
    }
    @Override
    public ResponseEntity<UserResponse> updateUser(String id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        // Vérifier et mettre à jour uniquement les champs non nuls
        if (updatedUser.getProfile() != null) {
            if (updatedUser.getProfile().getName() != null) {
                user.getProfile().setName(updatedUser.getProfile().getName());
            }
            if (updatedUser.getProfile().getLastname() != null) {
                user.getProfile().setLastname(updatedUser.getProfile().getLastname());
            }
            if (updatedUser.getProfile().getCountry() != null) {
                user.getProfile().setCountry(updatedUser.getProfile().getCountry());
            }
            if (updatedUser.getProfile().getTitle() != null) {
                user.getProfile().setTitle(updatedUser.getProfile().getTitle());
            }
            if (updatedUser.getProfile().getBio() != null) {
                user.getProfile().setBio(updatedUser.getProfile().getBio());
            }
        }

        // Mettre à jour les rôles uniquement si la liste n'est pas vide
        if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
            user.setRoles(updatedUser.getRoles());
        }

        // Mettre à jour les paramètres de sécurité si présents
        if (updatedUser.getSecurity() != null) {
            user.setSecurity(updatedUser.getSecurity());
        }

        // Sauvegarder l'utilisateur mis à jour
        userRepository.save(user);

        // Créer la réponse avec les données mises à jour
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .profile(new UserProfileResponse(user.getProfile()))
                .roles(user.getRoles().stream().map(Role::name).toList())
                .security(new UserSecurityResponse(user.getSecurity()))
                .build();

        return ResponseEntity.ok(userResponse);
    }

    @Override
    public ResponseEntity<StatusMessageResponse> deleteUser(String id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new StatusMessageResponse("Error", "User not found with ID: " + id));
        }
        userRepository.delete(user.get());
        return ResponseEntity.ok(new StatusMessageResponse("Success", "User deleted successfully"));
    }
    @Override
    public ResponseEntity<UserResponse> getUserById(String id) {
        Query query = new Query();
        query.addCriteria(Criteria.where("_id").is(id));

        User user = mongoTemplate.findOne(query, User.class);

        if (user == null) {
            throw new UserNotFoundException("User not found with ID: " + id);
        }

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .profile(new UserProfileResponse(user.getProfile()))
                .roles(user.getRoles().stream().map(Role::name).toList())
                .security(new UserSecurityResponse(user.getSecurity()))
                .build();

        return ResponseEntity.ok(userResponse);
    }


    @Override
    public ResponseEntity<UserResponse> addUser(User newUser) {
        // Check if a user with the given email already exists
        Optional<User> existingUser = userRepository.findByEmail(newUser.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body(null); // User already exists
        }

        // Save the new user
        User savedUser = userRepository.save(newUser);

        // Create response
        UserResponse userResponse = UserResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .profile(new UserProfileResponse(savedUser.getProfile()))
                .roles(savedUser.getRoles().stream().map(Role::name).toList())
                .security(new UserSecurityResponse(savedUser.getSecurity()))
                .build();

        return ResponseEntity.ok(userResponse);
    }

}
