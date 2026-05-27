package com.agromarket.domain.repository;

import java.util.List;

import com.agromarket.domain.model.Resena;

public interface ResenaRepository {
    List<Resena> findByProductoId(Long productoId);

    boolean existsByCompradorIdAndProductoId(Long compradorId, Long productoId);

    boolean tieneEntregado(Long compradorId, Long productoId);

    Resena save(Resena resena);

    void deleteById(Long id);
}
