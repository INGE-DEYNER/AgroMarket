package com.agromarket.domain.exceptions.payment;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando no se encuentra un pago.
 */
public class PaymentNotFoundException extends DomainException {

    public PaymentNotFoundException(String message) {
        super(message);
    }
}