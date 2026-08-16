package com.agromarket.application.adapters.persistence.sql.entities.rfq;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.application.adapters.persistence.sql.entities.product.ProductEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.models.rfq.QuoteOffer;

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
@Table(name = "quote_offers")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteOfferEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "request_for_quote_id", nullable = false)
        private RequestForQuoteEntity requestForQuote;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "producer_id", nullable = false)
        private UserEntity producer;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "product_id", nullable = false)
        private ProductEntity product;

        @Column(nullable = false, precision = 19, scale = 2)
        private BigDecimal proposedPrice;

        @Column(length = 2000)
        private String comments;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 30)
        private QuoteOfferStatus status;

        @Column(nullable = false)
        private LocalDateTime createdAt;

        public QuoteOffer toDomain() {
                return QuoteOffer.builder()
                                .id(id)
                                .requestForQuote(
                                                requestForQuote == null
                                                                ? null
                                                                : requestForQuote.toDomain())
                                .producer(
                                                producer == null
                                                                ? null
                                                                : producer.toDomain())
                                .product(
                                                product == null
                                                                ? null
                                                                : product.toDomain())
                                .proposedPrice(proposedPrice)
                                .comments(comments)
                                .status(status)
                                .createdAt(createdAt)
                                .build();
        }

        public static QuoteOfferEntity fromDomain(
                        QuoteOffer offer,
                        RequestForQuoteEntity requestEntity,
                        UserEntity producerEntity,
                        ProductEntity productEntity) {

                return QuoteOfferEntity.builder()
                                .id(offer.getId())
                                .requestForQuote(requestEntity)
                                .producer(producerEntity)
                                .product(productEntity)
                                .proposedPrice(offer.getProposedPrice())
                                .comments(offer.getComments())
                                .status(offer.getStatus())
                                .createdAt(offer.getCreatedAt())
                                .build();
        }
}
