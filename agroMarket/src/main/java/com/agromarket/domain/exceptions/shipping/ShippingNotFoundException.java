package com.agromarket.domain.exceptions.shipping;

/**
 * Excepción lanzada cuando no se encuentra un envío.
 */
public class ShippingNotFoundException extends RuntimeException {

    public ShippingNotFoundException(String message) {
        super(message);
    }
}