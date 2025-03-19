package org.example.courzelo.controllers.institution;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.responses.PaginatedInvitationsResponse;
import org.example.courzelo.services.IInvitationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitation")
@AllArgsConstructor
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class InvitationController {
    private final IInvitationService invitationService;
    @PutMapping("/{invitationID}/resend")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.canAccessInvitation(#invitationID)")
    public ResponseEntity<HttpStatus> resendInvitation(@PathVariable String invitationID){
        return invitationService.resendInvitation(invitationID);
    }
    @DeleteMapping("/{invitationID}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.canAccessInvitation(#invitationID)")
    public ResponseEntity<HttpStatus> deleteInvitation(@PathVariable String invitationID){
        return invitationService.deleteInvitation(invitationID);
    }
    @GetMapping("/{institutionID}")
    @PreAuthorize("hasAnyRole('ADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<PaginatedInvitationsResponse> getInvitations(@RequestParam int page, @RequestParam int sizePerPage,
                                                                       @RequestParam(required = false) String keyword, @PathVariable String institutionID){
        return invitationService.getInvitations(page, sizePerPage, keyword, institutionID);
    }
}
