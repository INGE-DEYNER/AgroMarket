package com.agromarket.infrastructure.persistence.adapters;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.RfqOferta;
import com.agromarket.domain.ports.out.RfqOfferRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.RfqMapper;
import com.agromarket.infrastructure.persistence.sql.entities.RfqOfertaEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.RfqOfertaJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RfqOfertaJpaAdapter implements RfqOfferRepositoryPort {

    private final RfqOfertaJpaRepository rfqOfertaJpaRepository;
    private final RfqMapper rfqMapper;

    @Override
    public Optional<RfqOferta> findById(Long id) {
        return rfqOfertaJpaRepository.findById(id).map(rfqMapper::toOfertaDomain);
    }

    @Override
    public RfqOferta save(RfqOferta offer) {
        RfqOfertaEntity entity = rfqMapper.toOfertaEntity(offer);
        RfqOfertaEntity savedEntity = rfqOfertaJpaRepository.save(entity);
        return rfqMapper.toOfertaDomain(savedEntity);
    }

    @Override
    public boolean existsByRfqIdAndProductorId(Long rfqId, Long producerId) {
        return rfqOfertaJpaRepository.existsByRfqIdAndProductorId(rfqId, producerId);
    }
}
