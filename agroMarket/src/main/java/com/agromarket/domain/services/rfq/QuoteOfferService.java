package com.agromarket.domain.services.rfq;

import java.math.BigDecimal;

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
    public boolean canBeAccepted(QuoteOffer offer) {

        return offer != null
                && !offer.isAccepted()
                && offer.getRequestForQuote() != null
                && offer.getProposedPrice() != null
                && offer.getProposedPrice()
                        .compareTo(BigDecimal.ZERO) > 0;
    }
}