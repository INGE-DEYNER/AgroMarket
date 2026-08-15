
package com.agromarket.domain.exceptions.rfq;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra una oferta de cotización.
 */
public class QuoteOfferNotFoundException extends DomainException {

    public QuoteOfferNotFoundException(String message) {
        super(message);
    }
}