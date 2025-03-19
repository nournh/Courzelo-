package org.example.courzelo.serviceImpls;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.ProfileInformationRequest;
import org.example.courzelo.dto.requests.UpdatePasswordRequest;
import org.example.courzelo.dto.responses.*;
import org.example.courzelo.exceptions.UserNotFoundException;
import org.example.courzelo.models.*;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.repositories.InstitutionRepository;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.services.ICodeVerificationService;
import org.example.courzelo.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.swagger2.mappers.ModelMapper;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.Principal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
@Slf4j
public class UserServiceImpl implements UserDetailsService, IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final ICodeVerificationService codeVerificationService;
    private final InstitutionRepository institutionRepository;
    public UserServiceImpl(UserRepository userRepository, @Lazy PasswordEncoder encoder, CodeVerificationService codeVerificationService, InstitutionRepository institutionRepository) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.codeVerificationService = codeVerificationService;
        this.institutionRepository = institutionRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findUserByEmail(email);
    }

    @Override
    public UserDetails loadUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    @Override
    public boolean ValidUser(String email) {
        User user = userRepository.findUserByEmail(email);
        return
                user != null
                && user.isAccountNonLocked()
                && user.isAccountNonExpired()
                && user.isCredentialsNonExpired()
                        && user.isEnabled();
    }

    @Override
    public ResponseEntity<StatusMessageResponse> updateUserProfile(ProfileInformationRequest profileInformationRequest, Principal principal) {
        log.info("Updating profile for user: " + principal.getName());
        log.info("Profile information: " + profileInformationRequest.toString());
        User user = userRepository.findUserByEmail(principal.getName());
        String name = profileInformationRequest.getName().toLowerCase();
        String lastName = profileInformationRequest.getLastname().toLowerCase();

        name = Character.toUpperCase(name.charAt(0)) + name.substring(1);
        lastName = Character.toUpperCase(lastName.charAt(0)) + lastName.substring(1);
        if(user.getProfile() == null) {
            user.setProfile(new UserProfile());
        }
        user.getProfile().setName(name);
        user.getProfile().setLastname(lastName);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        try {
            Date birthDate = null;
            if(profileInformationRequest.getBirthDate() != null)
            {
              birthDate = formatter.parse(profileInformationRequest.getBirthDate());
            }
            user.getProfile().setBirthDate(birthDate != null ? birthDate: user.getProfile().getBirthDate());
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
        user.getProfile().setBio(profileInformationRequest.getBio());
        user.getProfile().setTitle(profileInformationRequest.getTitle());
        user.getProfile().setGender(profileInformationRequest.getGender());
        user.getProfile().setCountry(profileInformationRequest.getCountry());
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Profile updated successfully"));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> uploadProfileImage(MultipartFile file, Principal principal) {
        try {
            // Define the path where you want to save the image
            String baseDir = "upload" + File.separator + principal.getName() + File.separator + "profile-image" + File.separator;

            // Create the directory if it doesn't exist
            File dir = new File(baseDir);
            if (!dir.exists()) {
                boolean dirsCreated = dir.mkdirs();
                if (!dirsCreated) {
                    throw new IOException("Failed to create directories");
                }
            }

            // Get the original file name
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            // Generate a random filename
            String newFileName = UUID.randomUUID() + extension;
            // Define the path to the new file
            String filePath = baseDir + newFileName;
            log.info("File path: " + filePath);
            Files.copy(file.getInputStream(), new File(filePath).toPath());
            // Save the file to the server
            //file.transferTo(new File(filePath));

            // Get the user
            User user = userRepository.findUserByEmail(principal.getName());
            //delete old image
            if(user.getProfile().getProfileImage() != null)
            {
                File oldImage = new File(user.getProfile().getProfileImage());
                if(oldImage.exists())
                {
                    oldImage.delete();
                }
            }
            // Save the file path and name in the user's profile
            user.getProfile().setProfileImage(filePath);
            // Save the user
            userRepository.save(user);

            return ResponseEntity.ok(new StatusMessageResponse("success", "Profile image uploaded successfully"));
        } catch (Exception e) {
            log.error("Error uploading image: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new StatusMessageResponse("error", "Could not upload the image. Please try again."));
        }
    }

    @Override
    public ResponseEntity<byte[]> getProfileImage(Principal principal, String email) {
        try {
            // Get the user
            User user = userRepository.findUserByEmail(email);
            if(user.getProfile().getProfileImage() == null){
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
            }
            String filePath = user.getProfile().getProfileImage();
            // Read the file
            byte[] image = Files.readAllBytes(new File(filePath).toPath());
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            log.error("Error getting image: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<LoginResponse> getUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
        Institution institution = null;
        if (user.getEducation() != null && user.getEducation().getInstitutionID() != null) {
            institution = institutionRepository.findById(user.getEducation().getInstitutionID()).orElse(null);
        }
        return ResponseEntity.ok(new LoginResponse("success", "User profile retrieved successfully",
                UserResponse.builder()
                        .email(user.getEmail())
                        .profile(new UserProfileResponse(user.getProfile()))
                        .roles(user.getRoles().stream().map(Role::name).toList())
                        .security(new UserSecurityResponse(user.getSecurity()))
                        .education(UserEducationResponse.builder()
                                .institutionID(user.getEducation().getInstitutionID())
                                .institutionName(institution != null ? institution.getName() : null)
                                .build())
                        .build()));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> updatePassword(UpdatePasswordRequest updatePasswordRequest, Principal principal) {
        log.info("Updating password for user: " + principal.getName());
        log.info("Password information: " + updatePasswordRequest.toString());
        User user = userRepository.findUserByEmail(principal.getName());
        if (!encoder.matches(updatePasswordRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new StatusMessageResponse("error", "Incorrect password"));
        }
        user.setPassword(encoder.encode(updatePasswordRequest.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Password updated successfully"));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> resetPassword(UpdatePasswordRequest updatePasswordRequest, String code) {
        CodeVerification codeVerification = codeVerificationService.verifyCode(code);
        if (codeVerification.getEmail()==null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new StatusMessageResponse("error", "Invalid or expired reset code"));
        }
        User user = userRepository.findUserByEmail(codeVerification.getEmail());
        user.setPassword(encoder.encode(updatePasswordRequest.getNewPassword()));
        codeVerificationService.deleteCode(codeVerification.getEmail(), CodeType.PASSWORD_RESET);
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Password reset successfully"));
    }

    @Override
    public ResponseEntity<QRCodeResponse> generateTwoFactorAuthQrCode(String email) {
        User user = userRepository.findUserByEmail(email);
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        final GoogleAuthenticatorKey key = gAuth.createCredentials();

        user.getSecurity().setTwoFactorAuthKey(key.getKey());
        userRepository.save(user);

        String qrCodeData = "otpauth://totp/" + email + "?secret=" + key.getKey() + "&issuer=Courzelo";
        byte[] qrCodeImage;
        try {
            qrCodeImage = generateQRCodeImage(qrCodeData, 200, 200);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Could not generate QR code", e);
        }
        String qrCodeImageBase64 = Base64.getEncoder().encodeToString(qrCodeImage);
        return ResponseEntity.ok(new QRCodeResponse("success", "QR code generated successfully", qrCodeImageBase64));
    }
    public byte[] generateQRCodeImage(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, ErrorCorrectionLevel> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }
    @Override
    public ResponseEntity<StatusMessageResponse> enableTwoFactorAuth(String email,String verificationCode){
        User user = userRepository.findUserByEmail(email);
        if (verificationCode.matches("\\d+") && verifyTwoFactorAuth(email, Integer.parseInt(verificationCode))) {
            user.getSecurity().setTwoFactorAuthEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok(new StatusMessageResponse("success", "Two-factor authentication enabled successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new StatusMessageResponse("error", "Invalid verification code"));
    }
    @Override
    public ResponseEntity<StatusMessageResponse> disableTwoFactorAuth(String email){
        User user = userRepository.findUserByEmail(email);
        user.getSecurity().setTwoFactorAuthKey(null);
        user.getSecurity().setTwoFactorAuthEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Two-factor authentication disabled successfully"));
    }
    @Override
    public boolean verifyTwoFactorAuth(String email, int verificationCode) {
        log.info("Starting TFA verification for user: {}", email);
        User user = userRepository.findUserByEmail(email);
        if(user == null) {
            log.warn("User not found: {}", email);
            return false;
        }
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        boolean isCodeValid = gAuth.authorize(user.getSecurity().getTwoFactorAuthKey(), verificationCode);
        if(isCodeValid) {
            log.info("TFA code verified for user: {}", email);
        } else {
            log.warn("Invalid TFA code {} for user: {}", verificationCode ,email);
        }
        return isCodeValid;
    }

    @Override
    public ResponseEntity<LoginResponse> getUserProfileByEmail(Principal principal, String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new LoginResponse("error", "User not found"));
        }
        Institution institution = null;
        if (user.getEducation() != null && user.getEducation().getInstitutionID() != null) {
            institution = institutionRepository.findById(user.getEducation().getInstitutionID()).orElse(null);
        }
        return ResponseEntity.ok(new LoginResponse("success", "User profile retrieved successfully",
                UserResponse.builder()
                        .email(user.getEmail())
                        .profile(new UserProfileResponse(user.getProfile()))
                        .roles(user.getRoles().stream().map(Role::name).toList())
                        .security(new UserSecurityResponse(user.getSecurity()))
                        .education(UserEducationResponse.builder()
                                .institutionID(user.getEducation().getInstitutionID())
                                .institutionName(institution != null ? institution.getName() : null)
                                .build())
                        .build()));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> addSkill(String email, String skill) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusMessageResponse("error", "User not found"));
        }

        String skillUpper = skill.toUpperCase();
        boolean added = user.getProfile().getSkills().add(skillUpper);
        if (!added) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusMessageResponse("error", "Skill already exists"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Skill added to user"));
    }

    @Override
    public ResponseEntity<?> getSkills(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusMessageResponse("error", "User not found"));
        }

        if (user.getProfile() == null || user.getProfile().getSkills() == null) {
            return ResponseEntity.ok(Collections.emptySet());
        }

        return ResponseEntity.ok(user.getProfile().getSkills());
    }

    public ResponseEntity<?> removeSkill(String email, String skill) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusMessageResponse("error", "User not found"));
        }

        if (user.getProfile() == null || user.getProfile().getSkills() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusMessageResponse("error", "User has no skills to remove"));
        }

        boolean removed = user.getProfile().getSkills().remove(skill);
        if (!removed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusMessageResponse("error", "Skill not found for this user"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new StatusMessageResponse("success", "Skill removed successfully"));
    }


    public User getProfById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher with id " + id + " doesn't exist!"));
        // Check if the user has the TEACHER role
        boolean hasTeacherRole = user.getRoles().stream()
                .anyMatch(role -> role == Role.TEACHER);
        if (!hasTeacherRole) {
            throw new RuntimeException("No TEACHER role found for user with id: " + id);
        }
        return user;
    }

    public User findUserById(String teacher) {
        return userRepository.findById(teacher)
                .orElseThrow(() -> new RuntimeException("User with id " + teacher + " doesn't exist!"));
    }
}
