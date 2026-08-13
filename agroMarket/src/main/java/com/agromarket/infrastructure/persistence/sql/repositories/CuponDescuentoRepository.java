package com.agromarket.infrastructure.persistence.sql.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento;

import java.util.Optional;
import java.util.List;

public interface CuponDescuentoRepository extends JpaRepository<CuponDescuento, Long> {
    Optional<CuponDescuento> findByCodigo(String codigo);
    List<CuponDescuento> findByUsuarioIdOrUsuarioIdIsNull(Long usuarioId);
}
