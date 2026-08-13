package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.ActualizarEnvioRequest;
import com.agromarket.interfaces.rest.response.EnvioResponse;

public interface EnvioService {
    EnvioResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    List<EnvioResponse> getMisEnvios(Long compradorId);

    List<EnvioResponse> getMisDespachos(Long productorId);

    EnvioResponse actualizar(Long id, ActualizarEnvioRequest request, Long productorId);

    int calcularDiasEntrega(String ciudadOrigen, String ciudadDestino);
}
