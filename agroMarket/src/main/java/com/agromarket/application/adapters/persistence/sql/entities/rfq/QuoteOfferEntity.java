package com.agromarket.application.adapters.persistence.sql.entities.rfq;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.domain.models.enums.rfq.QuoteOfferStatus;
import com.agromarket.domain.models.product.Product;
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
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quote_offers")
@Getter
@Setter
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

        @JoinColumn(name = "product_id", nullable = false)
        private Long productId;

        @Column(nullable = false, precision = 19, scale = 2)
        private BigDecimal proposedPrice;

        @Column(length = 2000)
        private String comments;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 30)
        private QuoteOfferStatus status;

        @Column(nullable = false)
        private LocalDateTime createdAt;

        public QuoteOffer toDomain(Product product) {

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
                                .product(product)
                                .proposedPrice(proposedPrice)
                                .comments(comments)
                                .status(status)
                                .createdAt(createdAt)
                                .build();
        }

        public static QuoteOfferEntity fromDomain(
                        QuoteOffer offer,
                        RequestForQuoteEntity requestForQuote,
                        UserEntity producer,
                        Long productId) {

                QuoteOfferEntity entity = new QuoteOfferEntity();

                entity.setId(offer.getId());
                entity.setRequestForQuote(requestForQuote);
                entity.setProducer(producer);
                entity.setProductId(productId);
                entity.setProposedPrice(offer.getProposedPrice());
                entity.setComments(offer.getComments());
                entity.setStatus(offer.getStatus());
                entity.setCreatedAt(offer.getCreatedAt());

                return entity;
        }
}
