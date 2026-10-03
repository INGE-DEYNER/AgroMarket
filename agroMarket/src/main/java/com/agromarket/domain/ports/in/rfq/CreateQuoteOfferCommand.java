package com.agromarket.domain.ports.in.rfq;

import java.math.BigDecimal;

/**
 * Comando de dominio para crear una oferta de cotización.
 *
 * No depende de application ni de infrastructure.
 */
public class CreateQuoteOfferCommand {

    private Long requestForQuoteId;
    private Long producerId;
    private Long productId;
    private BigDecimal proposedPrice;
    private String comments;

    public CreateQuoteOfferCommand() {
    }

    public CreateQuoteOfferCommand(
            Long requestForQuoteId,
            Long producerId,
            Long productId,
            BigDecimal proposedPrice,
            String comments) {

        this.requestForQuoteId = requestForQuoteId;
        this.producerId = producerId;
        this.productId = productId;
        this.proposedPrice = proposedPrice;
        this.comments = comments;
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

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}