package com.agromarket.application.persistence.sql.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.PagoEntity;

public interface PagoJpaRepository extends JpaRepository<PagoEntity, Long> {
    Optional<PagoEntity> findByPedidoId(Long pedidoId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoEntity p WHERE p.estado = com.agromarket.domain.model.EstadoPago.CONFIRMADO")
    java.math.BigDecimal sumMontoConfirmado();

    java.util.List<PagoEntity> findByEstado(com.agromarket.domain.models.enums.EstadoPago estado);
}
