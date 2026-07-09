package com.agromarket.domain.ports;

import java.util.Optional;

import com.agromarket.domain.models.Factura;

public interface FacturaRepository {
    Optional<Factura> findByPedidoId(Long pedidoId);

    Factura save(Factura factura);
}
