package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Resena;
import com.agromarket.domain.ports.out.ReviewRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.ResenaMapper;
import com.agromarket.infrastructure.persistence.sql.entities.ResenaEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.PedidoJpaRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.ResenaJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResenaJpaAdapter implements ReviewRepositoryPort {

    private final ResenaJpaRepository resenaJpaRepository;
    private final PedidoJpaRepository pedidoJpaRepository;
    private final ResenaMapper resenaMapper;

    @Override
    public List<Resena> findByProductId(Long productId) {
        return resenaJpaRepository.findByProductoId(productId).stream()
                .map(resenaMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByBuyerIdAndProductId(Long buyerId, Long productId) {
        return resenaJpaRepository.existsByCompradorIdAndProductoId(buyerId, productId);
    }

    @Override
    public boolean hasDeliveredOrder(Long buyerId, Long productId) {
        return pedidoJpaRepository.existsCompradorProductEntregado(buyerId, productId);
    }

    @Override
    public Resena save(Resena review) {
        ResenaEntity entity = resenaMapper.toEntity(review);
        ResenaEntity savedEntity = resenaJpaRepository.save(entity);
        return resenaMapper.toDomain(savedEntity);
    }
}
