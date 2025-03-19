package org.example.courzelo.exceptions;

public class NoTimeslotAvailableException extends RuntimeException {
    public NoTimeslotAvailableException(String message) {
        super(message);
    }
}
