package com.agromarket.domain.models.enums.rfq;



/**
 * Enumeración que representa los estados posibles de una solicitud
 * de cotización en AgroMarket.
 *
 * @author AgroMarket Team
 */
public enum RequestForQuoteStatus {

    /**
     * La solicitud está abierta y puede recibir ofertas.
     */
    OPEN,

    /**
     * La solicitud fue cerrada y ya no recibe nuevas ofertas.
     */
    CLOSED,

    /**
     * La solicitud superó su fecha límite.
     */
    EXPIRED
}