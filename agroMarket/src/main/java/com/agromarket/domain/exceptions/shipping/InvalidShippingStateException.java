package com.agromarket.domain.exceptions.shipping;
import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando una operación no es compatible con el estado actual del envío.
 */
public class InvalidShippingStateException extends DomainException {

    public InvalidShippingStateException(String message) {
        super(message);
    }
}