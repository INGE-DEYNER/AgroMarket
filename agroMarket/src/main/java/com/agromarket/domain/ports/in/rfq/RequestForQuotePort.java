package com.agromarket.domain.ports.in.rfq;

import java.util.List;

/**
 * Puerto de entrada para las operaciones de solicitudes de cotización.
 *
 * El dominio no conoce DTOs de application.
 */
public interface RequestForQuotePort {

    /**
     * Crea una solicitud de cotización.
     */
    RequestForQuoteResult create(
            CreateRequestForQuoteCommand command);

    /**
     * Obtiene todas las solicitudes activas.
     */
    List<RequestForQuoteResult> getActive();

    /**
     * Crea una oferta para una solicitud de cotización.
     */
    QuoteOfferResult offer(
            CreateQuoteOfferCommand command);

    /**
     * Obtiene las solicitudes creadas por un comprador.
     */
    List<RequestForQuoteResult> getMyRequests(
            Long buyerId);

    /**
     * Acepta una oferta.
     *
     * Al aceptar, el flujo de application podrá crear el pedido
     * correspondiente mediante los ports necesarios.
     */
    void acceptOffer(
            Long offerId,
            Long buyerId);
}