package org.example.courzelo.exceptions;

import lombok.Builder;
import lombok.Data;


public class ForumThreadNotFoundException extends RuntimeException {
    public ForumThreadNotFoundException(String message) {
        super(message);
    }
}
