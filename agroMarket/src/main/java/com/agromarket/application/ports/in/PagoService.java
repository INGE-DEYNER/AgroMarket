package com.agromarket.application.ports.in;

import com.agromarket.interfaces.rest.request.ProcesarPagoRequest;
import com.agromarket.interfaces.rest.response.PagoResponse;

public interface PagoService {
    PagoResponse procesar(ProcesarPagoRequest request, Long compradorId);

    PagoResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    com.agromarket.interfaces.rest.response.IniciarPagoResponse iniciar(com.agromarket.interfaces.rest.request.IniciarPagoRequest request, Long compradorId);

    PagoResponse confirmar(com.agromarket.interfaces.rest.request.ConfirmarPagoRequest request);
}
