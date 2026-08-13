package com.agromarket.infrastructure.persistence.sql.repositories;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.agromarket.infrastructure.persistence.sql.entities.PagoEntity;
import com.agromarket.domain.models.enums.EstadoPago;

public interface PagoJpaRepository extends JpaRepository<PagoEntity, Long> {
    Optional<PagoEntity> findByPedidoId(Long pedidoId);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoEntity p WHERE p.estado = :estado")
    BigDecimal sumMontoConfirmado(@org.springframework.data.repository.query.Param("estado") EstadoPago estado);

    default BigDecimal sumMontoConfirmado() {
        return sumMontoConfirmado(EstadoPago.CONFIRMADO);
    }

    List<PagoEntity> findByEstado(EstadoPago estado);
}
