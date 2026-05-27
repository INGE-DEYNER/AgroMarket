package com.agromarket.domain.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.agromarket.domain.model.Producto;
import com.agromarket.domain.model.TipoFruta;

public interface ProductoRepository {
    List<Producto> findAll();

    List<Producto> findByNombreContaining(String keyword);

    List<Producto> findByTipoFruta(TipoFruta tipo);

    List<Producto> findByPrecioBetween(BigDecimal min, BigDecimal max);

    List<Producto> findByDisponible();

    List<Producto> findByProductorId(Long productorId);

    Optional<Producto> findById(Long id);

    Producto save(Producto producto);

    void deleteById(Long id);
}
