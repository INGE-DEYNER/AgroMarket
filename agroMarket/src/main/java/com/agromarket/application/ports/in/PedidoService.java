package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.request.CrearPedidoRequest;
import com.agromarket.interfaces.rest.response.PedidoResponse;

public interface PedidoService {
    PedidoResponse crear(CrearPedidoRequest request, Long compradorId);

    List<PedidoResponse> getMisCompras(Long compradorId);

    List<PedidoResponse> getMisVentas(Long productorId);

    List<PedidoResponse> getAll();

    PedidoResponse avanzarEstado(Long pedidoId, Long solicitanteId);

    void cancelar(Long pedidoId, Long compradorId);

    PedidoResponse getById(Long pedidoId, Long solicitanteId);
}
