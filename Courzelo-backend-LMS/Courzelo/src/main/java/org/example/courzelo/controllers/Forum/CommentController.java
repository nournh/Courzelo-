package org.example.courzelo.controllers.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.CommentREQ;
import org.example.courzelo.dto.requests.forum.CommentResponse;
import org.example.courzelo.dto.requests.forum.CreateCommentRequest;
import org.example.courzelo.dto.requests.forum.PaginatedCommentsResponse;
import org.example.courzelo.dto.requests.forum.PaginatedPostsResponse;
import org.example.courzelo.models.Forum.Comment;
import org.example.courzelo.models.Forum.Post;
import org.example.courzelo.models.User;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.serviceImpls.Forum.CommentServiceImpl;
import org.example.courzelo.serviceImpls.Forum.PostServiceImpl;
import org.example.courzelo.services.Forum.ICommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("api/v1/comment")
@RestController
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final ICommentService commentService;
    @GetMapping("/{postID}/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaginatedCommentsResponse> getCommentsByPost(@PathVariable String postID, @RequestParam int page, @RequestParam int sizePerPage) {
        return commentService.getCommentsByPost(postID, page,sizePerPage);
    }
    @GetMapping("/{commentID}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponse> getComment(@PathVariable String commentID) {
        return commentService.getComment(commentID);
    }
    @PostMapping("{postID}/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HttpStatus> createComment(@PathVariable String postID, @RequestBody CreateCommentRequest commentRequest , Principal principal) {
        return commentService.saveComment(postID, commentRequest, principal);
    }
    @PutMapping("/{commentID}/update")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessComment(#commentID)")
    public ResponseEntity<HttpStatus> updateComment(@PathVariable String commentID, @RequestBody CreateCommentRequest commentRequest) {
        return commentService.updateComment(commentID, commentRequest);
    }
    @DeleteMapping("/{commentID}/delete")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessComment(#commentID)")
    public ResponseEntity<HttpStatus> deleteComment(@PathVariable String commentID) {
        return commentService.deleteComment(commentID);
    }

}
