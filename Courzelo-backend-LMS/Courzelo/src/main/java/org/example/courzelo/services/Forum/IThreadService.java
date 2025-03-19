package org.example.courzelo.services.Forum;

import org.example.courzelo.dto.requests.forum.CreateThreadRequest;
import org.example.courzelo.dto.requests.forum.ThreadResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface IThreadService {
    ResponseEntity<List<ThreadResponse>> getInstitutionThreads(String institutionID);

    ResponseEntity<HttpStatus> deleteThread(String id);

    ResponseEntity<ThreadResponse> getThread(String id);

    ResponseEntity<HttpStatus> saveThread(CreateThreadRequest threadRequest);

    ResponseEntity<HttpStatus> updateThread(String id, CreateThreadRequest threadRequest);
}
