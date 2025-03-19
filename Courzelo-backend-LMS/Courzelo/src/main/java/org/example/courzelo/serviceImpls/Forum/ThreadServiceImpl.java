package org.example.courzelo.serviceImpls.Forum;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.requests.forum.CreateThreadRequest;
import org.example.courzelo.dto.requests.forum.ThreadResponse;
import org.example.courzelo.exceptions.ForumThreadNotFoundException;
import org.example.courzelo.models.Forum.ForumThread;
import org.example.courzelo.repositories.Forum.ThreadRepository;
import org.example.courzelo.services.Forum.IPostService;
import org.example.courzelo.services.Forum.IThreadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThreadServiceImpl implements IThreadService {
    private final ThreadRepository threadRepository;
    private final IPostService postService;

    @Override
    public ResponseEntity<List<ThreadResponse>> getInstitutionThreads(String institutionID) {
        List<ThreadResponse> threadResponses = new ArrayList<>();
        threadRepository.findAllByInstitutionID(institutionID).ifPresent(
                threads -> {
                    threadResponses.addAll(threads.stream()
                            .map(thread -> ThreadResponse
                                    .builder()
                                    .id(thread.getId())
                                    .name(thread.getName())
                                    .description(thread.getDescription())
                                    .postsCount(thread.getPosts().size())
                                    .institutionID(thread.getInstitutionID())
                                    .build())
                            .toList());
                }
        );
        log.info("Threads: {}", threadResponses);
        return ResponseEntity.ok(threadResponses);
    }

    @Override
    public ResponseEntity<HttpStatus> deleteThread(String id) {
        ForumThread forumThread = threadRepository.findById(id)
                .orElseThrow(() -> new ForumThreadNotFoundException("Thread not found"));
        forumThread.getPosts().forEach(postService::deletePost);
        threadRepository.delete(forumThread);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<ThreadResponse> getThread(String id) {
        return threadRepository.findById(id)
                .map(thread -> ResponseEntity.ok(ThreadResponse.builder()
                        .id(thread.getId())
                        .name(thread.getName())
                                .description(thread.getDescription())
                                .postsCount(thread.getPosts().size())
                                .institutionID(thread.getInstitutionID())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<HttpStatus> saveThread(CreateThreadRequest threadRequest) {
        ForumThread thread = ForumThread.builder()
                .name(threadRequest.getName())
                .description(threadRequest.getDescription())
                .institutionID(threadRequest.getInstitutionID())
                .posts(new ArrayList<>())
                .build();
        threadRepository.save(thread);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<HttpStatus> updateThread(String id, CreateThreadRequest threadRequest) {
        ForumThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ForumThreadNotFoundException("Thread not found"));
        thread.setName(threadRequest.getName());
        thread.setDescription(threadRequest.getDescription());
        threadRepository.save(thread);
        return ResponseEntity.ok().build();
    }
}
