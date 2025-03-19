package org.example.courzelo.services.Forum;


import org.example.courzelo.dto.requests.forum.CreatePostRequest;
import org.example.courzelo.dto.requests.forum.PaginatedPostsResponse;
import org.example.courzelo.dto.requests.forum.PostResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.security.Principal;

public interface IPostService {

    ResponseEntity<PaginatedPostsResponse> getPostsByThread(String threadID, int page, String keyword, int sizePerPage);

    ResponseEntity<PostResponse> getPost(String postID);

    ResponseEntity<HttpStatus> savePost(CreatePostRequest postRequest, Principal principal);

    ResponseEntity<HttpStatus> updatePost(String postID, CreatePostRequest postRequest);

    ResponseEntity<HttpStatus> deletePost(String postID);
}
