package com.agromarket.application.persistence.sql.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.TarjetaPago;

import java.util.List;

public interface TarjetaPagoRepository extends JpaRepository<TarjetaPago, Long> {
    List<TarjetaPago> findByUsuarioIdAndActivaTrue(Long usuarioId);
}
