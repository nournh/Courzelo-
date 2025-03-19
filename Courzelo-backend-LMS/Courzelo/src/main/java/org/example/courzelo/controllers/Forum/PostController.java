package org.example.courzelo.controllers.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.example.courzelo.dto.requests.forum.CreatePostRequest;
import org.example.courzelo.dto.requests.forum.PaginatedPostsResponse;
import org.example.courzelo.dto.requests.forum.PostResponse;
import org.example.courzelo.dto.requests.forum.ThreadResponse;
import org.example.courzelo.dto.responses.PaginatedGroupsResponse;
import org.example.courzelo.repositories.Forum.PostRepository;

import org.example.courzelo.services.Forum.IPostService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RequestMapping("api/v1/post")
@RestController
@RequiredArgsConstructor
@Slf4j
public class PostController {
    private final IPostService postService;

    @GetMapping("/{threadID}/all")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessThread(#threadID)")
    public ResponseEntity<PaginatedPostsResponse> getPostsByThread(@PathVariable String threadID, @RequestParam int page, @RequestParam(required = false) String keyword, @RequestParam int sizePerPage) {
        return postService.getPostsByThread(threadID, page,keyword,sizePerPage);
    }
    @GetMapping("/{postID}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostResponse> getPost(@PathVariable String postID) {
        return postService.getPost(postID);
    }
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HttpStatus> createPost(@RequestBody CreatePostRequest postRequest, Principal principal) {
        return postService.savePost(postRequest,principal);
    }
    @PutMapping("/{postID}/update")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessPost(#postID)")
    public ResponseEntity<HttpStatus> updatePost(@PathVariable String postID, @RequestBody CreatePostRequest postRequest) {
        return postService.updatePost(postID, postRequest);
    }
    @DeleteMapping("/{postID}/delete")
    @PreAuthorize("isAuthenticated()&&@customAuthorization.canAccessPost(#postID)")
    public ResponseEntity<HttpStatus> deletePost(@PathVariable String postID) {
        return postService.deletePost(postID);
    }
}
