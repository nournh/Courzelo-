package org.example.courzelo.repositories.Forum;

import org.example.courzelo.models.Forum.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findAllByThreadIDOrderByCreatedDateDesc(String threadID, Pageable pageable);
    Page<Post> findAllByThreadIDAndContentContainingIgnoreCaseOrTitleContainingIgnoreCaseOrderByCreatedDateDesc(String threadID, String content,String title, Pageable pageable);
}
