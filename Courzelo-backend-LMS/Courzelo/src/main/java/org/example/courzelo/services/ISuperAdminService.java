package org.example.courzelo.services;

import org.example.courzelo.dto.responses.PaginatedUsersResponse;
import org.example.courzelo.dto.responses.StatusMessageResponse;
import org.example.courzelo.dto.responses.UserResponse;
import org.example.courzelo.models.User;
import org.springframework.http.ResponseEntity;

public interface ISuperAdminService {
   ResponseEntity<PaginatedUsersResponse> getAllUsers(int page, int size, String keyword);
   ResponseEntity<StatusMessageResponse> toggleUserBanStatus(String email);
   ResponseEntity<StatusMessageResponse> toggleUserEnabledStatus(String email);
   ResponseEntity<StatusMessageResponse> addRoleToUser(String email, String role);
    ResponseEntity<StatusMessageResponse> removeRoleFromUser(String email, String role);
    public ResponseEntity<UserResponse> updateUser(String id, User updatedUser);
    ResponseEntity<StatusMessageResponse> deleteUser(String id);
    ResponseEntity<UserResponse> getUserById(String id);
    public ResponseEntity<UserResponse> addUser(User newUser);

}
