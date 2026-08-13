package com.agromarket.application.ports.in;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.Envio;

public interface EnvioRepository {
    Optional<Envio> findByPedidoId(Long pedidoId);

    List<Envio> findByCompradorId(Long compradorId);

    Envio save(Envio envio);
}
