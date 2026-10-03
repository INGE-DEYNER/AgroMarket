package com.agromarket.domain.ports.out.rfq;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.rfq.QuoteOffer;

/**
 * Puerto de salida para la persistencia de ofertas de cotización.
 */
public interface QuoteOfferPort {

    /**
     * Busca una oferta por ID.
     */
    Optional<QuoteOffer> findById(
            Long id);

    /**
     * Guarda una oferta.
     */
    QuoteOffer save(
            QuoteOffer offer);

    /**
     * Verifica si un productor ya realizó una oferta para una solicitud.
     */
    boolean existsByRequestForQuoteIdAndProducerId(
            Long requestForQuoteId,
            Long producerId);

    /**
     * Obtiene todas las ofertas de una solicitud de cotización.
     */
    List<QuoteOffer> findByRequestForQuoteId(
            Long requestForQuoteId);
}