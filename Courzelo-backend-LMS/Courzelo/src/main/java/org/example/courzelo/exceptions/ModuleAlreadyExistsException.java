package org.example.courzelo.exceptions;

public class ModuleAlreadyExistsException extends RuntimeException {
    public ModuleAlreadyExistsException(String name) {
        super("Module with name " + name + " already exists");
    }
}
