package org.example.courzelo.services;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.example.courzelo.dto.requests.LoginRequest;
import org.example.courzelo.dto.requests.SignupRequest;
import org.example.courzelo.dto.responses.LoginResponse;
import org.example.courzelo.dto.responses.StatusMessageResponse;
import org.springframework.http.ResponseEntity;

import java.security.Principal;

public interface IAuthService {

    ResponseEntity<StatusMessageResponse> logout(String email, HttpServletRequest request, HttpServletResponse response);
    ResponseEntity<StatusMessageResponse> logout( HttpServletRequest request, HttpServletResponse response);

    ResponseEntity<LoginResponse> authenticateUser(LoginRequest loginRequest, @NonNull HttpServletResponse response);
    ResponseEntity<StatusMessageResponse> saveUser(SignupRequest signupRequest);
    ResponseEntity<LoginResponse> twoFactorAuthentication(String code, LoginRequest loginRequest, HttpServletResponse response);
    ResponseEntity<StatusMessageResponse> sendVerificationCode(String email);
    ResponseEntity<StatusMessageResponse> sendPasswordResetCode(String email);
    ResponseEntity<StatusMessageResponse> verifyEmail( String code);
    ResponseEntity<LoginResponse> checkAuth(Principal principal);

}
