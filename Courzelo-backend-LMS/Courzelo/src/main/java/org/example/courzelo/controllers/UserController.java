package org.example.courzelo.controllers;

import lombok.AllArgsConstructor;
import lombok.extern.java.Log;
import org.example.courzelo.dto.requests.ProfileInformationRequest;
import org.example.courzelo.dto.requests.UpdatePasswordRequest;
import org.example.courzelo.dto.requests.UserProfileRequest;
import org.example.courzelo.dto.responses.LoginResponse;
import org.example.courzelo.dto.responses.QRCodeResponse;
import org.example.courzelo.dto.responses.StatusMessageResponse;
import org.example.courzelo.dto.responses.UserResponse;
import org.example.courzelo.services.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/user")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
@PreAuthorize("isAuthenticated()")
public class UserController {
    private final IUserService userService;

    @PostMapping("/profile")
    public ResponseEntity<StatusMessageResponse> updateUserProfile(@RequestBody ProfileInformationRequest profileInformationRequest, Principal principal) {
        return userService.updateUserProfile(profileInformationRequest, principal);
    }

    @PostMapping("/image")
    public ResponseEntity<StatusMessageResponse> uploadProfileImage(@RequestParam("file") MultipartFile file, Principal principal) {
        return userService.uploadProfileImage(file, principal);
    }

    @GetMapping("/image")
    public ResponseEntity<byte[]> getProfileImage(Principal principal, @RequestParam String email) {
        return userService.getProfileImage(principal, email);
    }

    @GetMapping("/profile")
    public ResponseEntity<LoginResponse> getUserProfile(Principal principal) {
        return userService.getUserProfile(principal.getName());
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<LoginResponse> getUserProfileByEmail(Principal principal, @PathVariable String email) {
        return userService.getUserProfileByEmail(principal, email);
    }

    @PostMapping("/updatePassword")
    public ResponseEntity<StatusMessageResponse> updatePassword(@RequestBody UpdatePasswordRequest updatePasswordRequest, Principal principal) {
        return userService.updatePassword(updatePasswordRequest, principal);
    }

    @PostMapping("/reset-password")
    @PreAuthorize("permitAll")
    public ResponseEntity<StatusMessageResponse> resetPassword(@RequestBody UpdatePasswordRequest updatePasswordRequest, @RequestParam String code) {
        return userService.resetPassword(updatePasswordRequest, code);
    }

    @GetMapping("/qrCode")
    public ResponseEntity<QRCodeResponse> generateTwoFactorAuthQrCode(Principal principal) {
        return userService.generateTwoFactorAuthQrCode(principal.getName());
    }

    @PostMapping("/enableTwoFactorAuth")
    public ResponseEntity<StatusMessageResponse> enableTwoFactorAuth(@RequestParam String verificationCode, Principal principal) {
        return userService.enableTwoFactorAuth(principal.getName(), verificationCode);
    }

    @DeleteMapping("/disableTwoFactorAuth")
    public ResponseEntity<StatusMessageResponse> disableTwoFactorAuth(Principal principal) {
        return userService.disableTwoFactorAuth(principal.getName());
    }

    @PostMapping("/{email}/skills")
    public ResponseEntity<StatusMessageResponse> addSkillToUser(
            @PathVariable String email,
            @RequestParam String skill) {
        return userService.addSkill(email, skill);
    }

    @GetMapping("/{email}/skills")
    public ResponseEntity<?> getUserSkills(@PathVariable String email) {
        return userService.getSkills(email);
    }

    @DeleteMapping("/{email}/skills")
    public ResponseEntity<?> removeSkillFromUser(
            @PathVariable String email,
            @RequestParam String skill) {
        return userService.removeSkill(email, skill);
    }

}