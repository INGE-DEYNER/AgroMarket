package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.domain.rfq.model.QuoteOffer;
import com.agromarket.domain.rfq.ports.out.QuoteOfferRepository;
import com.agromarket.infrastructure.persistence.sql.mapper.RequestForQuoteMapper;
import com.agromarket.infrastructure.persistence.sql.entities.QuoteOfferEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.QuoteOfferJpaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Adaptador JPA que implementa el puerto QuoteOfferRepository.
 * Este adaptador gestiona la persistencia de ofertas de cotización en la base de datos,
 * permitiendo que el dominio no dependa directamente de JPA o Spring Data.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class QuoteOfferJpaAdapter implements QuoteOfferRepository {

    private final QuoteOfferJpaRepository quoteOfferJpaRepository;
    private final RequestForQuoteMapper requestForQuoteMapper;

    @Override
    public Optional<QuoteOffer> findById(Long id) {
        return quoteOfferJpaRepository.findById(id).map(requestForQuoteMapper::toQuoteOfferDomain);
    }

    @Override
    public QuoteOffer save(QuoteOffer offer) {
        QuoteOfferEntity entity = requestForQuoteMapper.toQuoteOfferEntity(offer);
        QuoteOfferEntity savedEntity = quoteOfferJpaRepository.save(entity);
        return requestForQuoteMapper.toQuoteOfferDomain(savedEntity);
    }

    @Override
    public boolean existsByRequestForQuoteIdAndProducerId(Long requestForQuoteId, Long producerId) {
        return quoteOfferJpaRepository.existsByRequestForQuoteIdAndProducerId(requestForQuoteId, producerId);
    }
}
