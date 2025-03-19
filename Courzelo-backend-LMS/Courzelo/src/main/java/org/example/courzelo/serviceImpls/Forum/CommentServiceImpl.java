package org.example.courzelo.serviceImpls.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.forum.CommentResponse;
import org.example.courzelo.dto.requests.forum.CreateCommentRequest;
import org.example.courzelo.dto.requests.forum.PaginatedCommentsResponse;
import org.example.courzelo.exceptions.ForumThreadNotFoundException;
import org.example.courzelo.models.Forum.Comment;

import org.example.courzelo.models.Forum.ForumThread;
import org.example.courzelo.models.Forum.Post;
import org.example.courzelo.repositories.Forum.CommentRepository;
import org.example.courzelo.repositories.Forum.PostRepository;
import org.example.courzelo.repositories.Forum.ThreadRepository;
import org.example.courzelo.services.Forum.ICommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements ICommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Override
    public ResponseEntity<PaginatedCommentsResponse> getCommentsByPost(String postID, int page, int sizePerPage) {
        Pageable pageable = PageRequest.of(page, sizePerPage);
        Page<Comment> commentPage = commentRepository.findAllByPostIDOrderByCreatedAtDesc(postID, pageable);
        List<Comment> comments = commentPage.getContent().stream().toList();
        List<CommentResponse> commentResponses = comments.stream().map(
                comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .content(comment.getContent())
                        .postID(comment.getPostID())
                        .userEmail(comment.getUserEmail())
                        .createdAt(comment.getCreatedAt())
                        .build()
        ).toList();
        return ResponseEntity.ok(PaginatedCommentsResponse.builder()
                .comments(commentResponses)
                .totalPages(commentPage.getTotalPages())
                .totalComments(commentPage.getTotalElements())
                .page(commentPage.getNumber())
                .build());
    }

    @Override
    public ResponseEntity<CommentResponse> getComment(String commentID) {
       Comment comment = commentRepository.findById(commentID).orElseThrow(
                () -> new CommentNotFoundException("Comment not found")
        );

        return ResponseEntity.ok(CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .postID(comment.getPostID())
                .userEmail(comment.getUserEmail())
                .createdAt(comment.getCreatedAt())
                .build()
        );
    }

    @Override
    public ResponseEntity<HttpStatus> saveComment(String postID, CreateCommentRequest commentRequest, Principal principal) {
        Comment comment = Comment.builder()
                .content(commentRequest.getContent())
                .postID(postID)
                .createdAt(LocalDateTime.now())
                .userEmail(principal.getName())
                .build();
        commentRepository.save(comment);
        Post post = postRepository.findById(postID).orElseThrow(
                () -> new ForumThreadNotFoundException("Post not found")
        );
        post.getCommentsID().add(comment.getId());
        postRepository.save(post);
        return ResponseEntity.ok(HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<HttpStatus> updateComment(String commentID, CreateCommentRequest commentRequest) {
        Comment comment = commentRepository.findById(commentID).orElseThrow(
                () -> new CommentNotFoundException("Comment not found")
        );
        comment.setContent(commentRequest.getContent());
        commentRepository.save(comment);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteComment(String commentID) {
        Comment comment = commentRepository.findById(commentID).orElseThrow(
                () -> new CommentNotFoundException("Comment not found")
        );
        Post post = postRepository.findById(comment.getPostID()).orElseThrow(
                () -> new ForumThreadNotFoundException("Post not found")
        );
        post.getCommentsID().remove(commentID);
        postRepository.save(post);
        commentRepository.delete(comment);
        return ResponseEntity.ok(HttpStatus.OK);
    }
}
