package com.agromarket.domain.exceptions.shipping;


/**
 * Excepción lanzada cuando una operación no es compatible con el estado actual del envío.
 */
public class InvalidShippingStateException extends RuntimeException {

    public InvalidShippingStateException(String message) {
        super(message);
    }
}