package com.agromarket.domain.ports.in.rfq;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;

/**
 * Resultado de una operación de consulta sobre una oferta.
 *
 * Contrato interno del dominio. No depende de application.
 */
public class QuoteOfferResult {

    private Long id;
    private Long requestForQuoteId;
    private Long producerId;
    private String producerName;
    private BigDecimal proposedPrice;
    private String comments;
    private QuoteOfferStatus status;
    private LocalDateTime createdAt;

    public QuoteOfferResult() {
    }

    public QuoteOfferResult(
            Long id,
            Long requestForQuoteId,
            Long producerId,
            String producerName,
            BigDecimal proposedPrice,
            String comments,
            QuoteOfferStatus status,
            LocalDateTime createdAt) {

        this.id = id;
        this.requestForQuoteId = requestForQuoteId;
        this.producerId = producerId;
        this.producerName = producerName;
        this.proposedPrice = proposedPrice;
        this.comments = comments;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestForQuoteId() {
        return requestForQuoteId;
    }

    public void setRequestForQuoteId(Long requestForQuoteId) {
        this.requestForQuoteId = requestForQuoteId;
    }

    public Long getProducerId() {
        return producerId;
    }

    public void setProducerId(Long producerId) {
        this.producerId = producerId;
    }

    public String getProducerName() {
        return producerName;
    }

    public void setProducerName(String producerName) {
        this.producerName = producerName;
    }

    public BigDecimal getProposedPrice() {
        return proposedPrice;
    }

    public void setProposedPrice(BigDecimal proposedPrice) {
        this.proposedPrice = proposedPrice;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public QuoteOfferStatus getStatus() {
        return status;
    }

    public void setStatus(QuoteOfferStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}