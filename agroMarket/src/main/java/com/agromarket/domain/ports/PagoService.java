package com.agromarket.domain.ports;

import com.agromarket.application.api.request.ProcesarPagoRequest;
import com.agromarket.application.api.response.PagoResponse;

public interface PagoService {
    PagoResponse procesar(ProcesarPagoRequest request, Long compradorId);

    PagoResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    com.agromarket.application.api.response.IniciarPagoResponse iniciar(com.agromarket.application.api.request.IniciarPagoRequest request, Long compradorId);

    PagoResponse confirmar(com.agromarket.application.api.request.ConfirmarPagoRequest request);
}
