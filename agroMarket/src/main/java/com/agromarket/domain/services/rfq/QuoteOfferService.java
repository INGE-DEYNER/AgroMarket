package com.agromarket.domain.services.rfq;

import java.math.BigDecimal;

import com.agromarket.domain.exceptions.rfq.InvalidQuoteOfferStateException;
import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.models.rfq.QuoteOffer;

/**
 * Servicio de dominio para reglas de ofertas de cotización.
 */
public class QuoteOfferService {

    /**
     * Verifica si una oferta puede ser aceptada.
     *
     * @param offer oferta
     * @return true si puede aceptarse
     */
    public boolean canBeAccepted(
            QuoteOffer offer) {

        return offer != null
                && !offer.isAccepted()
                && offer.getRequestForQuote() != null
                && offer.getProposedPrice() != null
                && offer.getProposedPrice()
                        .compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Rechaza una oferta.
     *
     * Solo las ofertas PENDING pueden pasar a REJECTED.
     *
     * @param offer oferta a rechazar
     * @throws InvalidQuoteOfferStateException si la oferta no está PENDING
     */
    public void reject(
            QuoteOffer offer) {

        if (offer == null) {
            throw new InvalidQuoteOfferStateException(
                    "No se puede rechazar una oferta inexistente");
        }

        if (offer.getStatus() != QuoteOfferStatus.PENDING) {
            throw new InvalidQuoteOfferStateException(
                    "Solo se puede rechazar una oferta en estado PENDING");
        }

        offer.setStatus(
                QuoteOfferStatus.REJECTED);
    }
}