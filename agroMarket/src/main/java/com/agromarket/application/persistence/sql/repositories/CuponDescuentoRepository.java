package com.agromarket.application.persistence.sql.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.application.persistence.sql.entities.CuponDescuento;

import java.util.Optional;
import java.util.List;

public interface CuponDescuentoRepository extends JpaRepository<CuponDescuento, Long> {
    Optional<CuponDescuento> findByCodigo(String codigo);
    List<CuponDescuento> findByUsuarioIdOrUsuarioIdIsNull(Long usuarioId);
}
