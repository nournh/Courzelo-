package org.example.courzelo.exceptions;

public class InstitutionNotFoundException extends RuntimeException{
    public InstitutionNotFoundException(String message) {
        super(message);
    }
}
