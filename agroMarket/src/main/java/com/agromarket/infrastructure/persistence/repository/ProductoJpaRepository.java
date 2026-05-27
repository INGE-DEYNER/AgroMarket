package com.agromarket.infrastructure.persistence.repository;

import java.math.BigDecimal;
import java.util.List;

import com.agromarket.domain.model.TipoFruta;
import com.agromarket.infrastructure.persistence.entity.ProductoEntity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoJpaRepository extends JpaRepository<ProductoEntity, Long> {
    List<ProductoEntity> findByNombreContainingIgnoreCase(String keyword);

    List<ProductoEntity> findByTipoFruta(TipoFruta tipo);

    List<ProductoEntity> findByPrecioBetween(BigDecimal min, BigDecimal max);

    List<ProductoEntity> findByCantidadDisponibleGreaterThan(Integer cantidad);

    List<ProductoEntity> findByProductorId(Long productorId);
}
