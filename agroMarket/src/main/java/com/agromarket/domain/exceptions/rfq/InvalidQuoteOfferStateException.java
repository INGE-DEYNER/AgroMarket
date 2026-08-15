package com.agromarket.domain.exceptions.rfq;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando se intenta realizar una operación incompatible
 * con el estado actual de una oferta de cotización.
 *
 * @author AgroMarket Team
 */
public class InvalidQuoteOfferStateException extends DomainException {

    /**
     * Constructor con mensaje descriptivo.
     *
     * @param message mensaje que describe el error
     */
    public InvalidQuoteOfferStateException(String message) {
        super(message);
    }
}