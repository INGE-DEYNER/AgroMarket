package com.agromarket.domain.models.enums.rfq;


/**
 * Enumeración que representa los estados posibles de una oferta
 * dentro de una solicitud de cotización.
 *
 * @author AgroMarket Team
 */
public enum QuoteOfferStatus {

    /**
     * La oferta está pendiente de decisión.
     */
    PENDING,

    /**
     * La oferta fue aceptada por el comprador.
     */
    ACCEPTED,

    /**
     * La oferta fue rechazada por el comprador.
     */
    REJECTED
}