package com.agromarket.domain.repository;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.model.Envio;

public interface EnvioRepository {
    Optional<Envio> findByPedidoId(Long pedidoId);

    List<Envio> findByCompradorId(Long compradorId);

    Envio save(Envio envio);
}
