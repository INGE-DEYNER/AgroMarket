package com.agromarket.domain.exceptions.messaging;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Se lanza cuando se busca un ticket de soporte que no existe.
 * El GlobalExceptionHandler la traduce a HTTP 404.
 */
public class TicketNotFoundException extends DomainException {

    public TicketNotFoundException(String message) {
        super(message);
    }
}
