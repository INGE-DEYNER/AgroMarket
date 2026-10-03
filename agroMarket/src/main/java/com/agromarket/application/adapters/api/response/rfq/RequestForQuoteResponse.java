package com.agromarket.application.adapters.api.response.rfq;

import java.time.LocalDateTime;
import java.util.List;

import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.ports.in.rfq.RequestForQuoteResult;

public record RequestForQuoteResponse(
        Long id,
        Long buyerId,
        String buyerName,
        FruitType fruitType,
        Double requiredQuantity,
        String description,
        LocalDateTime deadline,
        RequestForQuoteStatus status,
        LocalDateTime createdAt,
        List<QuoteOfferResponse> offers) {

    public static RequestForQuoteResponse fromResult(
            RequestForQuoteResult result,
            List<QuoteOfferResponse> offers) {

        if (result == null) {
            return null;
        }

        return new RequestForQuoteResponse(
                result.getId(),
                result.getBuyerId(),
                result.getBuyerName(),
                result.getFruitType(),
                result.getRequiredQuantity(),
                result.getDescription(),
                result.getDeadline(),
                result.getStatus(),
                result.getCreatedAt(),
                offers == null ? List.of() : List.copyOf(offers));
    }
}
