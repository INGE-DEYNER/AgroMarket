
package com.agromarket.domain.exceptions.payment;

/**
 * Excepción lanzada cuando una operación no es válida para el estado actual del pago.
 */
public class InvalidPaymentStateException extends RuntimeException {

    public InvalidPaymentStateException(String message) {
        super(message);
    }
}