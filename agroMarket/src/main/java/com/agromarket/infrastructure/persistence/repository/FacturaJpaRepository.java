package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.FacturaEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FacturaJpaRepository extends JpaRepository<FacturaEntity, Long> {
    Optional<FacturaEntity> findByPedidoId(Long pedidoId);
    java.util.List<FacturaEntity> findByPedidoCompradorId(Long compradorId);
}
