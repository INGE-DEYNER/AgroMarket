package com.agromarket.application.adapters.persistence.sql.adapters.rfq;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.sql.entities.rfq.RequestForQuoteEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.rfq.RequestForQuoteJpaRepository;
import com.agromarket.application.adapters.persistence.sql.entities.user.UserEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.user.UserJpaRepository;
import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.models.rfq.RequestForQuote;
import com.agromarket.domain.ports.out.rfq.RequestForQuotePort;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RequestForQuoteSqlAdapter
                implements RequestForQuotePort {

        private final RequestForQuoteJpaRepository repository;
        private final UserJpaRepository userRepository;

        @Override
        public RequestForQuote save(
                        RequestForQuote requestForQuote) {

                UserEntity buyer = userRepository.findById(
                                requestForQuote.getBuyer().getId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe el comprador con id "
                                                                + requestForQuote.getBuyer().getId()));

                return repository.save(
                                RequestForQuoteEntity.fromDomain(
                                                requestForQuote,
                                                buyer))
                                .toDomain();
        }

        @Override
        public Optional<RequestForQuote> findById(Long id) {
                return repository.findById(id)
                                .map(RequestForQuoteEntity::toDomain);
        }

        @Override
        public List<RequestForQuote> findAllActive() {
                return repository.findByStatus(
                                RequestForQuoteStatus.OPEN)
                                .stream()
                                .map(RequestForQuoteEntity::toDomain)
                                .toList();
        }

        @Override
        public List<RequestForQuote> findByBuyerId(Long buyerId) {
                return repository.findByBuyer_Id(buyerId)
                                .stream()
                                .map(RequestForQuoteEntity::toDomain)
                                .toList();
        }
}
