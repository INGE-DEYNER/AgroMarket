package com.agromarket.domain.exceptions.product;
import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando un producto no puede realizar una operación
 * debido a su estado actual.
 */
public class InvalidProductStateException extends DomainException {

    public InvalidProductStateException(String message) {
        super(message);
    }
}