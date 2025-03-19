package org.example.courzelo.exceptions;

public class SemesterMustBeInOrderException extends RuntimeException {
    public SemesterMustBeInOrderException(String message) {
        super(message);
    }
}
