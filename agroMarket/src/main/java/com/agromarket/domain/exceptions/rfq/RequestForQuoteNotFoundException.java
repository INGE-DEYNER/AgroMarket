package com.agromarket.domain.exceptions.rfq;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra una solicitud de cotización.
 */
public class RequestForQuoteNotFoundException extends DomainException {

    public RequestForQuoteNotFoundException(String message) {
        super(message);
    }
}