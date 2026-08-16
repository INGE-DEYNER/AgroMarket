package com.agromarket.domain.ports.in.rfq;

import java.util.List;

/**
 * Puerto de entrada para las operaciones específicas de ofertas
 * de solicitudes de cotización.
 */
public interface QuoteOfferPort {

    /**
     * Obtiene una oferta por su ID.
     */
    QuoteOfferResult getById(
            Long offerId);

    /**
     * Obtiene todas las ofertas de una solicitud.
     */
    List<QuoteOfferResult> getOffersForRequest(
            Long requestForQuoteId);

    /**
     * Rechaza una oferta perteneciente al comprador indicado.
     */
    void rejectOffer(
            Long offerId,
            Long buyerId);
}