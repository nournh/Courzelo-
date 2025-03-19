package org.example.courzelo.exceptions;

public class UserNotPartOfInstitutionException extends RuntimeException {
    public UserNotPartOfInstitutionException(String message) {
        super(message);
    }
}
