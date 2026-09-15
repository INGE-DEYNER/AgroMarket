package com.agromarket.domain.exceptions.shipping;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra un envío.
 */
public class ShippingNotFoundException extends DomainException {

    public ShippingNotFoundException(String message) {
        super(message);
    }
}