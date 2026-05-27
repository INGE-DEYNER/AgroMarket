package com.agromarket.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;

import com.agromarket.infrastructure.persistence.entity.EnvioEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvioJpaRepository extends JpaRepository<EnvioEntity, Long> {
    Optional<EnvioEntity> findByPedidoId(Long pedidoId);

    List<EnvioEntity> findByPedidoCompradorId(Long compradorId);
}
