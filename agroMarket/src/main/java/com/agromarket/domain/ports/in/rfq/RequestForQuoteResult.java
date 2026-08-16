package com.agromarket.domain.ports.in.rfq;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;

/**
 * Resultado de una operación de consulta sobre una solicitud de cotización.
 *
 * Contrato interno del dominio. No depende de application.
 */
public class RequestForQuoteResult {

    private Long id;
    private Long buyerId;
    private String buyerName;
    private FruitType fruitType;
    private Double requiredQuantity;
    private String description;
    private LocalDateTime deadline;
    private RequestForQuoteStatus status;
    private LocalDateTime createdAt;

    public RequestForQuoteResult() {
    }

    public RequestForQuoteResult(
            Long id,
            Long buyerId,
            String buyerName,
            FruitType fruitType,
            Double requiredQuantity,
            String description,
            LocalDateTime deadline,
            RequestForQuoteStatus status,
            LocalDateTime createdAt) {

        this.id = id;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.fruitType = fruitType;
        this.requiredQuantity = requiredQuantity;
        this.description = description;
        this.deadline = deadline;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public FruitType getFruitType() {
        return fruitType;
    }

    public void setFruitType(FruitType fruitType) {
        this.fruitType = fruitType;
    }

    public Double getRequiredQuantity() {
        return requiredQuantity;
    }

    public void setRequiredQuantity(Double requiredQuantity) {
        this.requiredQuantity = requiredQuantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public RequestForQuoteStatus getStatus() {
        return status;
    }

    public void setStatus(RequestForQuoteStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}