package com.agromarket.infrastructure.persistence.repository;

import java.util.List;

import com.agromarket.domain.model.EstadoPedido;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoJpaRepository extends JpaRepository<PedidoEntity, Long> {
    List<PedidoEntity> findByCompradorId(Long compradorId);

    List<PedidoEntity> findByProductoProductorId(Long productorId);

    List<PedidoEntity> findByEstado(EstadoPedido estado);
}
