package org.example.courzelo.controllers.institution;

import lombok.AllArgsConstructor;
import org.example.courzelo.dto.requests.GroupRequest;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.dto.responses.PaginatedGroupsResponse;
import org.example.courzelo.services.IGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/group")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
public class ClassGroupController {
    private final IGroupService iGroupService;
    @GetMapping("/{groupID}")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable String groupID) {
        return iGroupService.getGroup(groupID);
    }
    @GetMapping("/myGroup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupResponse> getMyGroup(Principal principal) {
        return iGroupService.getMyGroup(principal);
    }
    @GetMapping("/groups/{institutionID}")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessInstitution(#institutionID)")
    public ResponseEntity<PaginatedGroupsResponse> getGroupsByInstitution(@PathVariable String institutionID, @RequestParam int page,@RequestParam(required = false) String keyword, @RequestParam int sizePerPage) {
        return iGroupService.getGroupsByInstitution(institutionID, page,keyword,sizePerPage);
    }
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HttpStatus> createGroup(@RequestBody GroupRequest groupRequest) {
        return iGroupService.createGroup(groupRequest);
    }
    @PutMapping("/{groupID}/update")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<HttpStatus> updateGroup(@PathVariable String groupID, @RequestBody GroupRequest groupRequest) {
        return iGroupService.updateGroup(groupID, groupRequest);
    }
    @DeleteMapping("/{groupID}/delete")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<HttpStatus> deleteGroup(@PathVariable String groupID) {
        return iGroupService.deleteGroup(groupID);
    }
    @PutMapping("/{groupID}/addStudent")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessGroup(#groupID)")
    public ResponseEntity<HttpStatus> addStudentToGroup(@PathVariable String groupID, @RequestParam String student) {
        return iGroupService.addStudentToGroup(groupID, student);
    }
}
