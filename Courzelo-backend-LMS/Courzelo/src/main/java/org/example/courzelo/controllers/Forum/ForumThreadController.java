package org.example.courzelo.controllers.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.SubForumREQ;
import org.example.courzelo.dto.requests.forum.CreateThreadRequest;
import org.example.courzelo.dto.requests.forum.ThreadResponse;
import org.example.courzelo.dto.responses.GroupResponse;
import org.example.courzelo.models.Forum.Post;
import org.example.courzelo.models.User;
import org.example.courzelo.repositories.Forum.ThreadRepository;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.serviceImpls.Forum.PostServiceImpl;
import org.example.courzelo.services.Forum.IThreadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("api/v1/thread")
@RestController
@RequiredArgsConstructor
@Slf4j
public class ForumThreadController {
    private final IThreadService threadService;

    @GetMapping("{institutionID}/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ThreadResponse>> getInstitutionThread(@PathVariable String institutionID) {
        return threadService.getInstitutionThreads(institutionID);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessInstitution(#createThreadRequest.getInstitutionID())")
    public ResponseEntity<HttpStatus> addThread(@RequestBody CreateThreadRequest createThreadRequest) {
        return threadService.saveThread(createThreadRequest);
    }
    @PostMapping("/{threadID}/update")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessThread(#threadID)")
    public ResponseEntity<HttpStatus> updateThread(@PathVariable String threadID, @RequestBody CreateThreadRequest createThreadRequest) {
        return threadService.updateThread(threadID,createThreadRequest);
    }
    @DeleteMapping("/{threadID}/delete")
    @PreAuthorize("hasRole('ADMIN')&&@customAuthorization.canAccessThread(#threadID)")
    public ResponseEntity<HttpStatus> deleteThread(@PathVariable String threadID) {
        return threadService.deleteThread(threadID);
    }


}
