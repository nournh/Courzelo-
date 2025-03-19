package org.example.courzelo.exceptions;

public class UserAlreadyHasRoleException extends RuntimeException {
    public UserAlreadyHasRoleException(String message) {
        super(message);
    }
}
