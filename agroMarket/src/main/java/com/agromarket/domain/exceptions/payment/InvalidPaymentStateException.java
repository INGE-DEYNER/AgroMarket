
package com.agromarket.domain.exceptions.payment;


import com.agromarket.domain.exceptions.DomainException;


/**
 * Excepción lanzada cuando una operación no es válida para el estado actual del pago.
 */
public class InvalidPaymentStateException extends DomainException {

    public InvalidPaymentStateException(String message) {
        super(message);
    }
}