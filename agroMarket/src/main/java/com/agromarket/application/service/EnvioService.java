package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.ActualizarEnvioRequest;
import com.agromarket.application.dto.EnvioResponse;

public interface EnvioService {
    EnvioResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    List<EnvioResponse> getMisEnvios(Long compradorId);

    EnvioResponse actualizar(Long id, ActualizarEnvioRequest request, Long productorId);
}
