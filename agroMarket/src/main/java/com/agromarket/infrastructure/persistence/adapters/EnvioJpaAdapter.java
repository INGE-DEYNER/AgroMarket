package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Envio;
import com.agromarket.domain.ports.out.DeliveryRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.EnvioMapper;
import com.agromarket.infrastructure.persistence.sql.entities.EnvioEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.EnvioJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EnvioJpaAdapter implements DeliveryRepositoryPort {

    private final EnvioJpaRepository envioJpaRepository;
    private final EnvioMapper envioMapper;

    @Override
    public List<Envio> findByOrderId(Long orderId) {
        return envioJpaRepository.findByPedidoId(orderId).stream()
                .map(envioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Envio> findById(Long id) {
        return envioJpaRepository.findById(id).map(envioMapper::toDomain);
    }

    @Override
    public Envio save(Envio delivery) {
        EnvioEntity entity = envioMapper.toEntity(delivery);
        EnvioEntity savedEntity = envioJpaRepository.save(entity);
        return envioMapper.toDomain(savedEntity);
    }

    @Override
    public List<Envio> findAll() {
        return envioJpaRepository.findAll().stream()
                .map(envioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Envio> findByBuyerId(Long buyerId) {
        return envioJpaRepository.findByPedidoCompradorId(buyerId).stream()
                .map(envioMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Envio> findByProducerId(Long producerId) {
        return envioJpaRepository.findByPedidoProductoProductorId(producerId).stream()
                .map(envioMapper::toDomain)
                .collect(Collectors.toList());
    }
}
