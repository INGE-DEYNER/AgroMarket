package com.agromarket.infrastructure.persistence.sql.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.agromarket.domain.rfq.model.RequestForQuote;
import com.agromarket.domain.rfq.ports.out.RequestForQuoteRepository;
import com.agromarket.infrastructure.persistence.sql.entities.RequestForQuoteEntity;
import com.agromarket.infrastructure.persistence.sql.mapper.RequestForQuoteMapper;
import com.agromarket.infrastructure.persistence.sql.repositories.RequestForQuoteJpaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

/**
 * Adaptador JPA que implementa el puerto RequestForQuoteRepository.
 * Este adaptador gestiona la persistencia de solicitudes de cotización en la base de datos,
 * permitiendo que el dominio no dependa directamente de JPA o Spring Data.
 * 
 * @author AgroMarket Team
 */
@Component
@RequiredArgsConstructor
public class RequestForQuoteJpaAdapter implements RequestForQuoteRepository {

    private final RequestForQuoteJpaRepository requestForQuoteJpaRepository;
    private final RequestForQuoteMapper requestForQuoteMapper;

    @Override
    public RequestForQuote save(RequestForQuote requestForQuote) {
        RequestForQuoteEntity entity = requestForQuoteMapper.toEntity(requestForQuote);
        RequestForQuoteEntity savedEntity = requestForQuoteJpaRepository.save(entity);
        return requestForQuoteMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<RequestForQuote> findById(Long id) {
        return requestForQuoteJpaRepository.findById(id)
                .map(requestForQuoteMapper::toDomain);
    }

    @Override
    public List<RequestForQuote> findAllActive() {
        return requestForQuoteJpaRepository.findByActiveTrue().stream()
                .map(requestForQuoteMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<RequestForQuote> findByBuyerId(Long buyerId) {
        return requestForQuoteJpaRepository.findByBuyerId(buyerId).stream()
                .map(requestForQuoteMapper::toDomain)
                .collect(Collectors.toList());
    }
}
