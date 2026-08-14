package com.agromarket.domain.exceptions.product;

/**
 * Excepción lanzada cuando un producto no puede realizar una operación
 * debido a su estado actual.
 */
public class InvalidProductStateException extends RuntimeException {

    public InvalidProductStateException(String message) {
        super(message);
    }
}