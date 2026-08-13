package com.agromarket.application.ports.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.enums.TipoFruta;

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
