package com.agromarket.domain.repository;

import java.util.Optional;

import com.agromarket.domain.model.Factura;

public interface FacturaRepository {
    Optional<Factura> findByPedidoId(Long pedidoId);

    Factura save(Factura factura);
}
