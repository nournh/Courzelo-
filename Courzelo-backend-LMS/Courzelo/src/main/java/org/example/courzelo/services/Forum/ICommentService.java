package org.example.courzelo.services.Forum;

import org.example.courzelo.dto.requests.forum.CommentResponse;
import org.example.courzelo.dto.requests.forum.CreateCommentRequest;
import org.example.courzelo.dto.requests.forum.PaginatedCommentsResponse;
import org.example.courzelo.models.Forum.Comment;
import org.example.courzelo.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


import java.security.Principal;
import java.util.List;

public interface ICommentService {

    ResponseEntity<PaginatedCommentsResponse> getCommentsByPost(String postID, int page, int sizePerPage);

    ResponseEntity<CommentResponse> getComment(String commentID);

    ResponseEntity<HttpStatus> saveComment(String postID, CreateCommentRequest commentRequest, Principal principal);

    ResponseEntity<HttpStatus> updateComment(String commentID, CreateCommentRequest commentRequest);

    ResponseEntity<HttpStatus> deleteComment(String commentID);
}
