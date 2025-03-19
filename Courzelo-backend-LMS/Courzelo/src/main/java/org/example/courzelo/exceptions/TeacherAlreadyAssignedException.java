package org.example.courzelo.exceptions;

public class TeacherAlreadyAssignedException extends RuntimeException {
    public TeacherAlreadyAssignedException(String message) {
        super(message);
    }
}
