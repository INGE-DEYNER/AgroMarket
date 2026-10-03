package com.agromarket.application.adapters.persistence.sql.entities.rfq;

import java.time.LocalDateTime;

import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.models.rfq.RequestForQuote;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "request_for_quotes")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestForQuoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FruitType fruitType;

    @Column(nullable = false)
    private Double requiredQuantity;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestForQuoteStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public RequestForQuote toDomain() {
        return RequestForQuote.builder()
                .id(id)
                .buyer(buyer == null ? null : buyer.toDomain())
                .fruitType(fruitType)
                .requiredQuantity(requiredQuantity)
                .description(description)
                .deadline(deadline)
                .status(status)
                .createdAt(createdAt)
                .build();
    }

    public static RequestForQuoteEntity fromDomain(
            RequestForQuote request,
            UserEntity buyerEntity) {

        return RequestForQuoteEntity.builder()
                .id(request.getId())
                .buyer(buyerEntity)
                .fruitType(request.getFruitType())
                .requiredQuantity(request.getRequiredQuantity())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
