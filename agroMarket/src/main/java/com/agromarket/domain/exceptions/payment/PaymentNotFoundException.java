package com.agromarket.domain.exceptions.payment;

/**
 * Excepción lanzada cuando no se encuentra un pago.
 */
public class PaymentNotFoundException extends RuntimeException {

    public PaymentNotFoundException(String message) {
        super(message);
    }
}