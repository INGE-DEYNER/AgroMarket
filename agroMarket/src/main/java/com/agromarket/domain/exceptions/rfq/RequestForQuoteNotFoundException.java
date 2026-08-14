package com.agromarket.domain.exceptions.rfq;

/**
 * Excepción lanzada cuando no se encuentra una solicitud de cotización.
 */
public class RequestForQuoteNotFoundException extends RuntimeException {

    public RequestForQuoteNotFoundException(String message) {
        super(message);
    }
}