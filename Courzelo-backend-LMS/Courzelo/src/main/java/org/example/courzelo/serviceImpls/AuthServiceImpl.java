package org.example.courzelo.serviceImpls;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.LoginRequest;
import org.example.courzelo.dto.requests.SignupRequest;
import org.example.courzelo.dto.responses.*;
import org.example.courzelo.dto.responses.institution.SimplifiedClassRoomResponse;
import org.example.courzelo.exceptions.UserNotFoundException;
import org.example.courzelo.models.CodeType;
import org.example.courzelo.models.CodeVerification;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.repositories.*;
import org.example.courzelo.security.jwt.JWTUtils;
import org.example.courzelo.services.*;
import org.example.courzelo.utils.CookieUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AuthServiceImpl implements IAuthService {
    public static final String USER_NOT_FOUND = "User not found : ";
    private final UserRepository userRepository;
    private final IRefreshTokenService iRefreshTokenService;
    private final JWTUtils jwtUtils;
    private final PasswordEncoder encoder;
    private final CookieUtil cookieUtil;
    private final AuthenticationManager authenticationManager;
    private final IUserService userService;
    private final IMailService mailService;
    private final ICodeVerificationService codeVerificationService;
    private final InstitutionRepository institutionRepository;
    private final ClassRoomRepository classRoomRepository;
    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;
    @Value("${Security.app.jwtExpirationMs}")
    private long jwtExpirationMs;
    @Value("${Security.app.refreshExpirationMs}")
    private long refreshExpirationMs;
    @Value("${Security.app.refreshRememberMeExpirationMs}")
    private long refreshRememberMeExpirationMs;

    public AuthServiceImpl(UserRepository userRepository, IRefreshTokenService iRefreshTokenService, JWTUtils jwtUtils, PasswordEncoder encoder, CookieUtil cookieUtil, AuthenticationManager authenticationManager, IUserService userService, IMailService mailService, ICodeVerificationService codeVerificationService, InstitutionRepository institutionRepository, ClassRoomRepository classRoomRepository, GroupRepository groupRepository, CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.iRefreshTokenService = iRefreshTokenService;
        this.jwtUtils = jwtUtils;
        this.encoder = encoder;
        this.cookieUtil = cookieUtil;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.mailService = mailService;
        this.codeVerificationService = codeVerificationService;
        this.institutionRepository = institutionRepository;
        this.classRoomRepository = classRoomRepository;
        this.groupRepository = groupRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public ResponseEntity<StatusMessageResponse> logout(String email, HttpServletRequest request, HttpServletResponse response) {
        log.info("Logging out user");
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND + email));
            iRefreshTokenService.deleteUserTokens(user);
            log.info("User found");
            user.getActivity().setLastLogout(Instant.now());
            userRepository.save(user);
            new SecurityContextLogoutHandler().logout(request, response, null);
            response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createAccessTokenCookie("accessToken", 0L).toString());
            log.info("Logout: Access Token removed");
            response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createRefreshTokenCookie("refreshToken", 0L).toString());
            log.info("Logout :Refresh Token removed");
            log.info("User logged out");
            return ResponseEntity.ok(new StatusMessageResponse("success","User logged out successfully"));
    }

    @Override
    public ResponseEntity<StatusMessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, null);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createAccessTokenCookie("accessToken", 0L).toString());
        log.info("Logout: Access Token removed");
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createRefreshTokenCookie("refreshToken", 0L).toString());
        log.info("Logout :Refresh Token removed");
        log.info("User logged out");
        return ResponseEntity.ok(new StatusMessageResponse("success","User logged out successfully"));
    }

    public boolean isUserAuthenticated(){
        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                    String username = userDetails.getUsername();
                    log.info("Authenticated user's username: " + username);
                    return true;
                }
                return false;
            }
            log.info("User not authenticated");
            return false;
        }
        return false;
    }
    @Override
    public ResponseEntity<LoginResponse> authenticateUser(LoginRequest loginRequest, HttpServletResponse response) {
        log.info("Authenticating user");
        if(isUserAuthenticated()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error", "User already authenticated"));
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();
            if(userDetails.getSecurity().isTwoFactorAuthEnabled())
            {
                log.info("Two factor authentication enabled");
                return ResponseEntity.status(HttpStatus.OK).body(new LoginResponse("succes","TFA code required",true));
            }
            setHeaders(response,userDetails,loginRequest.isRememberMe());
            userDetails.getActivity().setLastLogin(Instant.now());
            userDetails.getSecurity().setRememberMe(loginRequest.isRememberMe());
            userRepository.save(userDetails);
            Institution institution = null;
            if (userDetails.getEducation() != null && userDetails.getEducation().getInstitutionID() != null) {
                institution = institutionRepository.findById(userDetails.getEducation().getInstitutionID()).orElse(null);
            }
            List<String> courses;
            if( userDetails.getEducation()!= null &&userDetails.getEducation().getGroupID()!=null)
            {
                log.info("User has group");
                Group group = groupRepository.findById(userDetails.getEducation().getGroupID()).orElse(null);
                if(group!=null && group.getClassRooms()!=null)
                {
                   courses = group.getClassRooms();
                   log.info("Courses: "+courses);
                } else {
                    courses = new ArrayList<>();
                }
            } else {
                courses = new ArrayList<>();
            }
            if(userDetails.getEducation()!= null&&userDetails.getEducation().getClassroomsID() != null){
                userDetails.getEducation().getClassroomsID().forEach(
                        courseID -> {
                            if(!courses.contains(courseID)){
                                log.info("user has course teaching");
                                courses.add(courseID);
                            }
                        }
                );
            }

            log.info("User authenticated successfully");
            return ResponseEntity.ok(new LoginResponse("success","Login successful",
                    UserResponse.builder()
                            .email(userDetails.getEmail())
                            .profile(new UserProfileResponse(userDetails.getProfile()))
                            .roles(userDetails.getRoles().stream().map(Role::name).toList())
                            .security(new UserSecurityResponse(userDetails.getSecurity()))
                            .education(UserEducationResponse.builder()
                                    .institutionID(userDetails.getEducation().getInstitutionID())
                                    .institutionName(institution != null ? institution.getName() : null)
                                    .groupID(userDetails.getEducation().getGroupID() != null ? userDetails.getEducation().getGroupID() : null)
                                    .classrooms(!courses.isEmpty() ? courses.stream().map(
                                            courseID -> {
                                                log.info("Course ID: "+courseID);
                                                ClassRoom classRoom = classRoomRepository.findById(courseID).orElseThrow();
                                                return SimplifiedClassRoomResponse.builder().classroomID(classRoom.getId()).course(classRoom.getCourse()).build();
                                            }
                                    ).toList() : null)
                                    .build())
                            .build()));
        } catch (DisabledException e) {
            log.error("User not verified");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error","Please verify your email first"));
        } catch (LockedException e) {
            log.error("User account locked");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error","Account locked"));
        } catch (AuthenticationException e) {
            log.error("Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponse("error","Invalid email or password"));
        }
    }

    void setHeaders(HttpServletResponse response,User userDetails,boolean rememberMe){
        iRefreshTokenService.deleteUserTokens(userDetails);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createAccessTokenCookie(jwtUtils.generateJwtToken(userDetails.getEmail()), jwtExpirationMs-50000L).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.createRefreshTokenCookie(
                iRefreshTokenService.createRefreshToken(userDetails.getEmail(), rememberMe ? refreshRememberMeExpirationMs : refreshExpirationMs).getToken()
                , rememberMe ? refreshRememberMeExpirationMs : refreshExpirationMs).toString());
    }

    @Override
    public ResponseEntity<StatusMessageResponse> saveUser(SignupRequest signupRequest) {
        log.info(signupRequest.toString());
        if(userRepository.existsByEmail(signupRequest.getEmail())){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new StatusMessageResponse("error","Email already in use"));
        }
        User user = new User(
                signupRequest.getEmail().toLowerCase(),
                signupRequest.getName(),
                signupRequest.getLastname(),
                signupRequest.getBirthDate(),
                signupRequest.getGender(),
                signupRequest.getCountry(),
                encoder.encode(signupRequest.getPassword())
        );
        userRepository.save(user);
        sendVerificationCode(user.getEmail());
        return ResponseEntity.ok(new StatusMessageResponse("success","User registered successfully"));
    }

    @Override
    public ResponseEntity<LoginResponse> twoFactorAuthentication(String code, LoginRequest loginRequest, HttpServletResponse response) {
        log.info("Authenticating user");
        if(isUserAuthenticated()){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error", "User already authenticated"));
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();
            if(!userService.verifyTwoFactorAuth(userDetails.getEmail(),Integer.parseInt(code)))
            {
                log.error("Invalid two factor authentication code");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponse("error","Invalid two factor authentication code"));
            }
            setHeaders(response,userDetails,loginRequest.isRememberMe());
            userDetails.getActivity().setLastLogin(Instant.now());
            userDetails.getSecurity().setRememberMe(loginRequest.isRememberMe());
            userRepository.save(userDetails);
            Institution institution = null;
            if (userDetails.getEducation() != null && userDetails.getEducation().getInstitutionID() != null) {
                institution = institutionRepository.findById(userDetails.getEducation().getInstitutionID()).orElse(null);
            }
            List<String> courses;
            if( userDetails.getEducation()!= null &&userDetails.getEducation().getGroupID()!=null)
            {
                log.info("User has group");
                Group group = groupRepository.findById(userDetails.getEducation().getGroupID()).orElse(null);
                if(group!=null && group.getClassRooms()!=null)
                {
                    courses = group.getClassRooms();
                    log.info("Courses: "+courses);
                } else {
                    courses = new ArrayList<>();
                }
            } else {
                courses = new ArrayList<>();
            }
            if(userDetails.getEducation()!= null&&userDetails.getEducation().getClassroomsID() != null){
                userDetails.getEducation().getClassroomsID().forEach(
                        courseID -> {
                            if(!courses.contains(courseID)){
                                log.info("user has course teaching");
                                courses.add(courseID);
                            }
                        }
                );
            }

            log.info("User authenticated successfully");
            return ResponseEntity.ok(new LoginResponse("success","Login successful",
                    UserResponse.builder()
                            .email(userDetails.getEmail())
                            .profile(new UserProfileResponse(userDetails.getProfile()))
                            .roles(userDetails.getRoles().stream().map(Role::name).toList())
                            .security(new UserSecurityResponse(userDetails.getSecurity()))
                            .education(UserEducationResponse.builder()
                                    .institutionID(userDetails.getEducation().getInstitutionID())
                                    .institutionName(institution != null ? institution.getName() : null)
                                    .groupID(userDetails.getEducation().getGroupID() != null ? userDetails.getEducation().getGroupID() : null)
                                    .classrooms(!courses.isEmpty() ? courses.stream().map(
                                            courseID -> {
                                                log.info("Course ID: "+courseID);
                                                ClassRoom classRoom = classRoomRepository.findById(courseID).orElseThrow();
                                                return SimplifiedClassRoomResponse.builder().classroomID(classRoom.getId()).course(classRoom.getCourse()).build();
                                            }
                                    ).toList() : null)
                                    .build())
                            .build()));
        } catch (DisabledException e) {
            log.error("User not verified");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error","Please verify your email first"));
        } catch (LockedException e) {
            log.error("User account locked");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new LoginResponse("error","Account locked"));
        } catch (AuthenticationException e) {
            log.error("Invalid email or password");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new LoginResponse("error","Invalid email or password"));
        }
    }

    @Override
    public ResponseEntity<StatusMessageResponse> sendVerificationCode(String email) {
        if(userRepository.existsByEmail(email)){
            CodeVerification codeVerification = codeVerificationService.saveCode(
                    CodeType.EMAIL_VERIFICATION,
                    email,
                    codeVerificationService.generateCode(),
                    Instant.now().plusSeconds(3600*24)
            );
            mailService.sendConfirmationEmail(userRepository.findUserByEmail(email),codeVerification);
            return ResponseEntity.ok(new StatusMessageResponse("success","Verification code sent successfully"));
        }
        throw new UserNotFoundException("User not found");
    }

    @Override
    public ResponseEntity<StatusMessageResponse> sendPasswordResetCode(String email) {
        if(userRepository.existsByEmail(email)){
            CodeVerification codeVerification = codeVerificationService.saveCode(
                    CodeType.PASSWORD_RESET,
                    email,
                    codeVerificationService.generateCode(),
                    Instant.now().plusSeconds(3600)
            );
            mailService.sendPasswordResetEmail(userRepository.findUserByEmail(email),codeVerification);
            return ResponseEntity.ok(new StatusMessageResponse("success","Verification code sent successfully"));
        }
        throw new UserNotFoundException("User not found");
    }

    @Override
    public ResponseEntity<StatusMessageResponse> verifyEmail(String code) {
        log.info("Verifying email");
        log.info("Code: "+code);
        CodeVerification codeVerification = codeVerificationService.verifyCode(code);
        if(codeVerification.getEmail()!= null){
            log.info("Email verified");
            User user = userRepository.findUserByEmail(codeVerification.getEmail());
            user.getSecurity().setEnabled(true);
            userRepository.save(user);
            codeVerificationService.deleteCode(codeVerification.getEmail(),CodeType.EMAIL_VERIFICATION);
            return ResponseEntity.ok(new StatusMessageResponse("success","Email verified successfully"));
        }
        log.info("Invalid verification code");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new StatusMessageResponse("error","Invalid verification code"));
    }

    @Override
    public ResponseEntity<LoginResponse> checkAuth(Principal principal) {
        if(isUserAuthenticated()){
            User user = userRepository.findUserByEmail(principal.getName());
            Institution institution = null;
            if (user.getEducation() != null && user.getEducation().getInstitutionID() != null) {
                institution = institutionRepository.findById(user.getEducation().getInstitutionID()).orElse(null);
            }
            List<String> courses;
            if( user.getEducation()!= null &&user.getEducation().getGroupID()!=null)
            {
                log.info("User has group");
                Group group = groupRepository.findById(user.getEducation().getGroupID()).orElse(null);
                if(group!=null && group.getClassRooms()!=null)
                {
                    courses = group.getClassRooms();
                    log.info("Courses: "+courses);
                } else {
                    courses = new ArrayList<>();
                }
            } else {
                courses = new ArrayList<>();
            }
            if(user.getEducation()!= null&&user.getEducation().getClassroomsID() != null){
                user.getEducation().getClassroomsID().forEach(
                        courseID -> {
                            if(!courses.contains(courseID)){
                                log.info("user has course teaching");
                                courses.add(courseID);
                            }
                        }
                );
            }

            log.info("User authenticated successfully");
            return ResponseEntity.ok(new LoginResponse("success","Login successful",
                    UserResponse.builder()
                            .email(user.getEmail())
                            .profile(new UserProfileResponse(user.getProfile()))
                            .roles(user.getRoles().stream().map(Role::name).toList())
                            .security(new UserSecurityResponse(user.getSecurity()))
                            .education(UserEducationResponse.builder()
                                    .institutionID(user.getEducation().getInstitutionID())
                                    .institutionName(institution != null ? institution.getName() : null)
                                    .groupID(user.getEducation().getGroupID() != null ? user.getEducation().getGroupID() : null)
                                    .classrooms(!courses.isEmpty() ? courses.stream().map(
                                            courseID -> {
                                                log.info("Course ID: "+courseID);
                                                ClassRoom classRoom = classRoomRepository.findById(courseID).orElseThrow();
                                                return SimplifiedClassRoomResponse.builder().classroomID(classRoom.getId()).course(classRoom.getCourse()).build();
                                            }
                                    ).toList() : null)
                                    .build())
                            .build()));
        }
        return ResponseEntity.status(HttpStatus.OK).body(new LoginResponse("error","User not authenticated"));
    }



}
