package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Rfq;
import com.agromarket.domain.ports.out.RfqRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.RfqMapper;
import com.agromarket.infrastructure.persistence.sql.entities.RfqEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.RfqJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RfqJpaAdapter implements RfqRepositoryPort {

    private final RfqJpaRepository rfqJpaRepository;
    private final RfqMapper rfqMapper;

    @Override
    public Optional<Rfq> findById(Long id) {
        return rfqJpaRepository.findById(id).map(rfqMapper::toDomain);
    }

    @Override
    public List<Rfq> findAll() {
        return rfqJpaRepository.findAll().stream()
                .map(rfqMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Rfq> findByBuyerId(Long buyerId) {
        return rfqJpaRepository.findByCompradorId(buyerId).stream()
                .map(rfqMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Rfq> findActiveRfqs() {
        return rfqJpaRepository.findByActivoTrue().stream()
                .map(rfqMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Rfq save(Rfq rfq) {
        RfqEntity entity = rfqMapper.toEntity(rfq);
        RfqEntity savedEntity = rfqJpaRepository.save(entity);
        return rfqMapper.toDomain(savedEntity);
    }
}
