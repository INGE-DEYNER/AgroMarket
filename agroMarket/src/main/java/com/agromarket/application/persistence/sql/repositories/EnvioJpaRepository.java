package com.agromarket.application.persistence.sql.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.EnvioEntity;

public interface EnvioJpaRepository extends JpaRepository<EnvioEntity, Long> {
    Optional<EnvioEntity> findByPedidoId(Long pedidoId);

    List<EnvioEntity> findByPedidoCompradorId(Long compradorId);

    List<EnvioEntity> findByPedidoProductoProductorId(Long productorId);
}
