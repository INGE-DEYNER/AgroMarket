package com.agromarket.infrastructure.persistence.adapters;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.enums.EstadoPedido;
import com.agromarket.domain.ports.out.OrderRepositoryPort;
import com.agromarket.infrastructure.persistence.mapper.PedidoMapper;
import com.agromarket.infrastructure.persistence.sql.entities.PedidoEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.PedidoJpaRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PedidoJpaAdapter implements OrderRepositoryPort {

    private final PedidoJpaRepository pedidoJpaRepository;
    private final PedidoMapper pedidoMapper;

    @Override
    public List<Pedido> findByBuyerId(Long buyerId) {
        return pedidoJpaRepository.findByCompradorId(buyerId).stream()
                .map(pedidoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Pedido> findByProducerId(Long producerId) {
        return pedidoJpaRepository.findByProductoProductorId(producerId).stream()
                .map(pedidoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Pedido> findByStatus(EstadoPedido status) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public List<Pedido> findAll() {
        return pedidoJpaRepository.findAll().stream()
                .map(pedidoMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Pedido> findById(Long id) {
        return pedidoJpaRepository.findById(id).map(pedidoMapper::toDomain);
    }

    @Override
    public Pedido save(Pedido order) {
        PedidoEntity entity = pedidoMapper.toEntity(order);
        PedidoEntity savedEntity = pedidoJpaRepository.save(entity);
        return pedidoMapper.toDomain(savedEntity);
    }

    @Override
    public long count() {
        return pedidoJpaRepository.count();
    }

    @Override
    public List<Pedido> findByCheckoutId(String checkoutId) {
        return pedidoJpaRepository.findByCheckoutId(checkoutId).stream()
                .map(pedidoMapper::toDomain)
                .collect(Collectors.toList());
    }
}
