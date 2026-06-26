package com.agromarket.infrastructure.persistence.repository;

import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.PagoEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoJpaRepository extends JpaRepository<PagoEntity, Long> {
    Optional<PagoEntity> findByPedidoId(Long pedidoId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoEntity p WHERE p.estado = com.agromarket.domain.model.EstadoPago.CONFIRMADO")
    java.math.BigDecimal sumMontoConfirmado();
}
