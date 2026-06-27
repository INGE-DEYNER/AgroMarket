package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.FacturaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaJpaRepository extends JpaRepository<FacturaEntity, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    Optional<FacturaEntity> findByPedidoId(Long pedidoId);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    Optional<FacturaEntity> findById(Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    java.util.List<FacturaEntity> findByPedidoCompradorId(Long compradorId);
}
