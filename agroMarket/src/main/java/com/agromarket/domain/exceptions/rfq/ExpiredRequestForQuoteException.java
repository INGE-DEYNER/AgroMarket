
package com.agromarket.domain.exceptions.rfq;

import com.agromarket.domain.exceptions.DomainException;

/**
 * Excepción lanzada cuando se intenta operar sobre una solicitud de cotización
 * que ya ha expirado.
 *
 * @author AgroMarket Team
 */
public class ExpiredRequestForQuoteException extends DomainException {

    /**
     * Constructor con mensaje descriptivo.
     *
     * @param message mensaje que describe el error
     */
    public ExpiredRequestForQuoteException(String message) {
        super(message);
    }
}