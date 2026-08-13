package com.agromarket.application.ports.in;

import java.util.Optional;

import com.agromarket.domain.models.Pago;

public interface PagoRepository {
    Optional<Pago> findByPedidoId(Long pedidoId);

    Pago save(Pago pago);
}
