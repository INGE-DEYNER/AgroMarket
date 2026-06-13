package com.agromarket.application.service;

import com.agromarket.application.dto.PagoResponse;
import com.agromarket.application.dto.ProcesarPagoRequest;

public interface PagoService {
    PagoResponse procesar(ProcesarPagoRequest request, Long compradorId);

    PagoResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    com.agromarket.application.dto.IniciarPagoResponse iniciar(com.agromarket.application.dto.IniciarPagoRequest request, Long compradorId);

    PagoResponse confirmar(com.agromarket.application.dto.ConfirmarPagoRequest request);
}
