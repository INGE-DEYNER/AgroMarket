package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.request.ActualizarEnvioRequest;
import com.agromarket.application.api.response.EnvioResponse;

public interface EnvioService {
    EnvioResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    List<EnvioResponse> getMisEnvios(Long compradorId);

    List<EnvioResponse> getMisDespachos(Long productorId);

    EnvioResponse actualizar(Long id, ActualizarEnvioRequest request, Long productorId);

    int calcularDiasEntrega(String ciudadOrigen, String ciudadDestino);
}
