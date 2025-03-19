package org.example.courzelo.exceptions;

public class ProgramAlreadyExistsException extends RuntimeException {
    public ProgramAlreadyExistsException(String message) {
        super(message);
    }
}
