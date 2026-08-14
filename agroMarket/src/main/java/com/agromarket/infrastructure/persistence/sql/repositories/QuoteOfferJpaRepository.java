package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.QuoteOfferEntity;

public interface QuoteOfferJpaRepository extends JpaRepository<QuoteOfferEntity, Long> {
    List<QuoteOfferEntity> findByRequestForQuoteId(Long requestForQuoteId);
    List<QuoteOfferEntity> findByProducerId(Long producerId);
    boolean existsByRequestForQuoteIdAndProducerId(Long requestForQuoteId, Long producerId);
}
