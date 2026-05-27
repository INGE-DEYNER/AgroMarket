package com.agromarket.domain.repository;

import java.util.Optional;

import com.agromarket.domain.model.Pago;

public interface PagoRepository {
    Optional<Pago> findByPedidoId(Long pedidoId);

    Pago save(Pago pago);
}
