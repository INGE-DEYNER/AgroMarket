
package com.agromarket.domain.exceptions.rfq;

/**
 * Excepción lanzada cuando no se encuentra una oferta de cotización.
 */
public class QuoteOfferNotFoundException extends RuntimeException {

    public QuoteOfferNotFoundException(String message) {
        super(message);
    }
}