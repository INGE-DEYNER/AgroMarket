package com.agromarket.application.persistence.sql.repositories;

import java.util.List;

import com.agromarket.application.persistence.sql.entities.PedidoEntity;
import com.agromarket.domain.models.enums.EstadoPedido;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoJpaRepository extends JpaRepository<PedidoEntity, Long> {
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"comprador", "producto", "producto.productor"})
    List<PedidoEntity> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"comprador", "producto", "producto.productor"})
    List<PedidoEntity> findByCompradorId(Long compradorId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"comprador", "producto", "producto.productor"})
    List<PedidoEntity> findByProductoProductorId(Long productorId);

    List<PedidoEntity> findByEstado(EstadoPedido estado);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"comprador", "producto", "producto.productor"})
    List<PedidoEntity> findByCheckoutId(String checkoutId);
}
