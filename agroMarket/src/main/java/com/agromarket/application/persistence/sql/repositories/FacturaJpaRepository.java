package com.agromarket.application.persistence.sql.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.FacturaEntity;

public interface FacturaJpaRepository extends JpaRepository<FacturaEntity, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    Optional<FacturaEntity> findByPedidoId(Long pedidoId);

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    Optional<FacturaEntity> findById(Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.comprador", "pedido.producto", "pedido.producto.productor"})
    java.util.List<FacturaEntity> findByPedidoCompradorId(Long compradorId);
}
