package org.example.courzelo.exceptions;

public class InvitationNotFoundException extends RuntimeException{
    public InvitationNotFoundException(String message) {
        super(message);
    }
}
