package com.agromarket.application.adapters.api.response.rfq;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.ports.in.rfq.QuoteOfferResult;

public record QuoteOfferResponse(
        Long id,
        Long requestForQuoteId,
        Long producerId,
        String producerName,
        BigDecimal proposedPrice,
        String comments,
        QuoteOfferStatus status,
        LocalDateTime createdAt) {

    public static QuoteOfferResponse fromResult(QuoteOfferResult result) {
        if (result == null) {
            return null;
        }

        return new QuoteOfferResponse(
                result.getId(),
                result.getRequestForQuoteId(),
                result.getProducerId(),
                result.getProducerName(),
                result.getProposedPrice(),
                result.getComments(),
                result.getStatus(),
                result.getCreatedAt());
    }
}
