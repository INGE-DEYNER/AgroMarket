package com.agromarket.domain.ports.in.rfq;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.product.FruitType;

/**
 * Comando de dominio para crear una solicitud de cotización.
 *
 * No depende de application ni de infrastructure.
 */
public class CreateRequestForQuoteCommand {

    private Long buyerId;
    private FruitType fruitType;
    private Double requiredQuantity;
    private String description;
    private LocalDateTime deadline;

    public CreateRequestForQuoteCommand() {
    }

    public CreateRequestForQuoteCommand(
            Long buyerId,
            FruitType fruitType,
            Double requiredQuantity,
            String description,
            LocalDateTime deadline) {

        this.buyerId = buyerId;
        this.fruitType = fruitType;
        this.requiredQuantity = requiredQuantity;
        this.description = description;
        this.deadline = deadline;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
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
}