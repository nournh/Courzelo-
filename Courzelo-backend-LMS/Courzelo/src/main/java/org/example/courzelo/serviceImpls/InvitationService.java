package org.example.courzelo.serviceImpls;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.responses.InvitationResponse;
import org.example.courzelo.dto.responses.PaginatedInvitationsResponse;
import org.example.courzelo.exceptions.InstitutionNotFoundException;
import org.example.courzelo.exceptions.InvitationNotFoundException;
import org.example.courzelo.models.CodeType;
import org.example.courzelo.models.CodeVerification;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.models.institution.Invitation;
import org.example.courzelo.models.institution.InvitationStatus;
import org.example.courzelo.repositories.CodeVerificationRepository;
import org.example.courzelo.repositories.InstitutionRepository;
import org.example.courzelo.repositories.InvitationRepository;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.services.IInvitationService;
import org.example.courzelo.services.IMailService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class InvitationService implements IInvitationService {
    private final InvitationRepository invitationRepository;
    private final CodeVerificationRepository codeVerificationRepository;
    private final CodeVerificationService codeVerificationService;
    private final IMailService mailService;
    private final InstitutionRepository institutionRepository;
    private final static String INSTITUTION_NOT_FOUND = "Institution not found";
    private final static String INVITATION_NOT_FOUND = "Invitation not found";
    private final UserRepository userRepository;

    @Override
    public void createInvitation(String institutionID, String email, Role role, List<String> skills, String code, LocalDateTime expiryDate) {
        Invitation invitation = null;
        if (invitationRepository.existsByEmailAndInstitutionID(email, institutionID)) {
            invitation = invitationRepository.findByEmailAndInstitutionID(email,institutionID).orElseThrow(() -> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
            invitation.setRole(role);
            invitation.setCode(code);
            invitation.setSkills(skills != null ? skills : new ArrayList<>());
            invitation.setStatus(InvitationStatus.PENDING);
            invitation.setExpiryDate(expiryDate);
        }else{
            invitation = Invitation.builder()
                    .institutionID(institutionID)
                    .email(email)
                    .role(role)
                    .skills(skills != null ? skills : new ArrayList<>())
                    .code(code)
                    .status(InvitationStatus.PENDING)
                    .expiryDate(expiryDate)
                    .build();
        }
        invitationRepository.save(invitation);
    }

    @Override
    public void updateInvitationStatus(String email,String institutionID, InvitationStatus status) {
        Invitation invitation = invitationRepository.findByEmailAndInstitutionID(email,institutionID).orElseThrow(() -> new InvitationNotFoundException(INVITATION_NOT_FOUND));
        if (invitation != null) {
            invitation.setStatus(status);
            if(status.equals(InvitationStatus.ACCEPTED)){
                invitation.setExpiryDate(null);
            }
            invitationRepository.save(invitation);
        }
    }

    @Override
    public void setUserSkills(String email, String institutionID) {
        Invitation invitation = invitationRepository.findByEmailAndInstitutionID(email,institutionID).orElseThrow(() -> new InvitationNotFoundException(INVITATION_NOT_FOUND));
        if (invitation.getSkills() != null) {
            User user = userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("User not found"));
            user.getEducation().setSkill(invitation.getSkills());
            userRepository.save(user);
        }
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Runs every hour
    public void updateExpiredInvitations() {
        log.info("Deleting expired invitations");
        invitationRepository.findAllByStatusAndExpiryDateBefore(InvitationStatus.PENDING, LocalDateTime.now())
                .ifPresent(expiredInvitations -> expiredInvitations.forEach(invitation -> {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
        }));
    }

    @Override
    public ResponseEntity<HttpStatus> resendInvitation(String invitationID) {
        Invitation invitation = invitationRepository.findById(invitationID).orElseThrow(() -> new InvitationNotFoundException(INVITATION_NOT_FOUND));
        Institution institution = institutionRepository.findById(invitation.getInstitutionID()).orElseThrow(() -> new InstitutionNotFoundException(INSTITUTION_NOT_FOUND));
        CodeVerification codeVerification = codeVerificationRepository.findById(invitation.getCode()).orElseGet(() ->
                codeVerificationService.saveCode(
                        CodeType.INSTITUTION_INVITATION,
                        codeVerificationService.generateCode(),
                        invitation.getEmail(),
                        invitation.getRole(),
                        invitation.getInstitutionID(),
                        Instant.now().plusSeconds(86400)
                )
        );
        if(invitation.getCode().equals(codeVerification.getId())) {
            codeVerification.setExpiryDate(Instant.now().plusSeconds(86400));
            codeVerificationRepository.save(codeVerification);
            invitation.setExpiryDate(LocalDateTime.ofInstant(codeVerification.getExpiryDate(), ZoneId.systemDefault()));
            invitation.setStatus(InvitationStatus.PENDING);
            invitationRepository.save(invitation);
        }else{
            invitation.setCode(codeVerification.getId());
            invitation.setStatus(InvitationStatus.PENDING);
            invitation.setExpiryDate(LocalDateTime.ofInstant(codeVerification.getExpiryDate(), ZoneId.systemDefault()));
            invitationRepository.save(invitation);
        }
        mailService.sendInstituionInvitationEmail(invitation.getEmail(),institution,codeVerification);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteInvitation(String invitationID) {
        Invitation invitation = invitationRepository.findById(invitationID).orElseThrow(() -> new InvitationNotFoundException(INVITATION_NOT_FOUND));
        if(invitation.getCode() != null){
            codeVerificationRepository.deleteById(invitation.getCode());
        }
        invitationRepository.deleteById(invitationID);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteExpiredInvitations() {
        invitationRepository.deleteAllByExpiryDateBefore(LocalDateTime.now());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<PaginatedInvitationsResponse> getInvitations(int page, int sizePerPage, String keyword, String institutionID) {
        log.info("Fetching invitations for institutionID: {}", institutionID);
        Pageable pageable = PageRequest.of(page, sizePerPage);
        Page<Invitation> invitationsPage;

        if (keyword != null && !keyword.isEmpty()) {
            log.info("Fetching invitations for institutionID: {} with keyword: {}", institutionID, keyword);
            invitationsPage = invitationRepository.findByInstitutionIDAndKeyword(institutionID, keyword, pageable);
        } else {
            log.info("Fetching invitations for institutionID: {}", institutionID);
            invitationsPage = invitationRepository.findByInstitutionID(institutionID, pageable);
        }
        log.info("Fetched {} invitations", invitationsPage.getNumberOfElements());
        PaginatedInvitationsResponse response = PaginatedInvitationsResponse.builder()
                .invitations(invitationsPage.getContent().stream()
                        .map(invitation -> {
                            CodeVerification codeVerification = invitation.getCode() != null ? codeVerificationRepository.findById(invitation.getCode()).orElse(null) : null;
                            return InvitationResponse.builder()
                                    .id(invitation.getId())
                                    .email(invitation.getEmail())
                                    .code(codeVerification != null ? codeVerification.getCode() : null)
                                    .skills(invitation.getSkills()!= null ? invitation.getSkills() : new ArrayList<>())
                                    .status(invitation.getStatus().name())
                                    .role(invitation.getRole().name())
                                    .expiryDate(invitation.getExpiryDate())
                                    .build();
                        })
                        .collect(Collectors.toList()))
                .currentPage(invitationsPage.getNumber())
                .totalPages(invitationsPage.getTotalPages())
                .totalItems(invitationsPage.getTotalElements())
                .itemsPerPage(invitationsPage.getSize())
                .build();
        log.info("Returning {} invitations", response.getInvitations().size());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
