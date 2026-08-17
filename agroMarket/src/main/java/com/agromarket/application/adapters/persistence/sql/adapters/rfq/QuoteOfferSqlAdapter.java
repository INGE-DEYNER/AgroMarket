package com.agromarket.application.adapters.persistence.sql.adapters.rfq;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import com.agromarket.application.adapters.persistence.sql.entities.rfq.QuoteOfferEntity;
import com.agromarket.application.adapters.persistence.sql.entities.rfq.RequestForQuoteEntity;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.rfq.QuoteOfferJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.rfq.RequestForQuoteJpaRepository;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.rfq.QuoteOffer;
import com.agromarket.domain.ports.out.rfq.QuoteOfferPort;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.product.ProductPort;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class QuoteOfferSqlAdapter implements QuoteOfferPort {

        private final QuoteOfferJpaRepository repository;
        private final RequestForQuoteJpaRepository requestRepository;
        private final UserJpaRepository userRepository;
        private final ProductPort productPort;

        private QuoteOffer toDomain(QuoteOfferEntity entity) {
                Product product = entity.getProductId() == null
                                ? null
                                : productPort.findById(entity.getProductId()).orElse(null);

                return entity.toDomain(product);
        }

        @Override
        public QuoteOffer save(QuoteOffer offer) {

                RequestForQuoteEntity request = requestRepository
                                .findById(offer.getRequestForQuote().getId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe la RFQ con id "
                                                                + offer.getRequestForQuote().getId()));

                UserEntity producer = userRepository
                                .findById(offer.getProducer().getId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe el productor con id "
                                                                + offer.getProducer().getId()));

                return repository.save(
                                QuoteOfferEntity.fromDomain(
                                                offer,
                                                request,
                                                producer,
                                                offer.getProduct() == null
                                                                ? null
                                                                : offer.getProduct().getId()))
                                .toDomain(offer.getProduct());
        }

        @Override
        public Optional<QuoteOffer> findById(Long id) {
                return repository.findById(id)
                                .map(entity -> toDomain(entity));
        }

        @Override
        public boolean existsByRequestForQuoteIdAndProducerId(
                        Long requestForQuoteId,
                        Long producerId) {

                return repository
                                .existsByRequestForQuote_IdAndProducer_Id(
                                                requestForQuoteId,
                                                producerId);
        }

        @Override
        public List<QuoteOffer> findByRequestForQuoteId(
                        Long requestForQuoteId) {

                return repository
                                .findByRequestForQuote_Id(requestForQuoteId)
                                .stream()
                                .map(entity -> toDomain(entity))
                                .toList();
        }
}
