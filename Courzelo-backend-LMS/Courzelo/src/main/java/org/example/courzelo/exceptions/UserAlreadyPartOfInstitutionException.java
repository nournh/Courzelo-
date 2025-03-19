package org.example.courzelo.exceptions;

public class UserAlreadyPartOfInstitutionException extends RuntimeException {
    public UserAlreadyPartOfInstitutionException(String message) {
        super(message);
    }
}
