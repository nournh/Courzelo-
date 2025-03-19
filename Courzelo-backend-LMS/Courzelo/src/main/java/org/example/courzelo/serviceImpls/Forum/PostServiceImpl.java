package org.example.courzelo.serviceImpls.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.forum.CreatePostRequest;
import org.example.courzelo.dto.requests.forum.PaginatedPostsResponse;
import org.example.courzelo.dto.requests.forum.PostResponse;
import org.example.courzelo.exceptions.ForumThreadNotFoundException;
import org.example.courzelo.exceptions.PostNotFoundException;
import org.example.courzelo.models.Forum.ForumThread;
import org.example.courzelo.models.Forum.Post;

import org.example.courzelo.repositories.Forum.PostRepository;
import org.example.courzelo.repositories.Forum.ThreadRepository;
import org.example.courzelo.services.Forum.ICommentService;
import org.example.courzelo.services.Forum.IPostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements IPostService {
    private final PostRepository postRepository;
    private final ThreadRepository threadRepository;
    private final ICommentService commentService;

    @Override
    public ResponseEntity<PaginatedPostsResponse> getPostsByThread(String threadID, int page, String keyword, int sizePerPage) {
        Pageable pageable = PageRequest.of(page, sizePerPage);
        Page<Post> postPage;
        if(keyword == null) {
            postPage = postRepository.findAllByThreadIDOrderByCreatedDateDesc(threadID, pageable);
        } else {
            postPage = postRepository.findAllByThreadIDAndContentContainingIgnoreCaseOrTitleContainingIgnoreCaseOrderByCreatedDateDesc(threadID, keyword, keyword, pageable);
        }
        List<Post> posts = postPage.getContent().stream().toList();
        List<PostResponse> postResponses = posts.stream().map(
                post -> PostResponse.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .threadID(post.getThreadID())
                        .userEmail(post.getUserEmail())
                        .createdDate(post.getCreatedDate())
                        .description(post.getDescription())
                        .commentsSize(post.getCommentsID().size())
                        .build()
        ).toList();
        return ResponseEntity.ok(PaginatedPostsResponse.builder()
                .posts(postResponses)
                .totalPages(postPage.getTotalPages())
                .totalPosts(postPage.getTotalElements())
                .page(postPage.getNumber())
                .build());
    }

    @Override
    public ResponseEntity<PostResponse> getPost(String postID) {
        Post post = postRepository.findById(postID).orElseThrow(
                () -> new PostNotFoundException("Post not found ")
        );
        return ResponseEntity.ok(PostResponse.builder()
                .id(post.getId())
                        .title(post.getTitle())
                .content(post.getContent())
                .threadID(post.getThreadID())
                .userEmail(post.getUserEmail())
                .createdDate(post.getCreatedDate())
                .description(post.getDescription())
                .commentsSize(post.getCommentsID().size())
                .build());
    }

    @Override
    public ResponseEntity<HttpStatus> savePost(CreatePostRequest postRequest, Principal principal) {
        Post post = Post.builder()
                .title(postRequest.getTitle())
                .content(postRequest.getContent())
                .description(postRequest.getDescription())
                .threadID(postRequest.getThreadID())
                .userEmail(principal.getName())
                .commentsID(new ArrayList<>())
                .createdDate(LocalDateTime.now())
                .build();
        postRepository.save(post);
        ForumThread thread = threadRepository.findById(postRequest.getThreadID()).orElseThrow(()->new ForumThreadNotFoundException("Thread not found"));
        thread.getPosts().add(post.getId());
        threadRepository.save(thread);
        return ResponseEntity.ok(HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<HttpStatus> updatePost(String postID, CreatePostRequest postRequest) {
        Post post = postRepository.findById(postID).orElseThrow(
                () -> new PostNotFoundException("Post not found ")
        );
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setDescription(postRequest.getDescription());
        postRepository.save(post);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<HttpStatus> deletePost(String postID) {
        Post post = postRepository.findById(postID).orElseThrow(
                () -> new PostNotFoundException("Post not found ")
        );
        post.getCommentsID().forEach(commentService::deleteComment);
        ForumThread thread = threadRepository.findById(post.getThreadID()).orElseThrow(()->new ForumThreadNotFoundException("Thread not found"));
        thread.getPosts().remove(postID);
        threadRepository.save(thread);
        postRepository.delete(post);
        return ResponseEntity.ok(HttpStatus.OK);
    }
}
