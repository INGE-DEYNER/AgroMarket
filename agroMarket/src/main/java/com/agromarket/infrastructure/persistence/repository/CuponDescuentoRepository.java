package com.agromarket.infrastructure.persistence.repository;

import com.agromarket.infrastructure.persistence.entity.CuponDescuento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CuponDescuentoRepository extends JpaRepository<CuponDescuento, Long> {
    Optional<CuponDescuento> findByCodigo(String codigo);
    List<CuponDescuento> findByUsuarioIdOrUsuarioIdIsNull(Long usuarioId);
}
