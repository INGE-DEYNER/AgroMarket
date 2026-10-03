package com.agromarket.application.adapters.persistence.sql.repositories.rfq;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.adapters.persistence.sql.entities.rfq.QuoteOfferEntity;

public interface QuoteOfferJpaRepository
                extends JpaRepository<QuoteOfferEntity, Long> {

        List<QuoteOfferEntity> findByRequestForQuote_Id(
                        Long requestForQuoteId);

        boolean existsByRequestForQuote_IdAndProducer_Id(
                        Long requestForQuoteId,
                        Long producerId);
}
