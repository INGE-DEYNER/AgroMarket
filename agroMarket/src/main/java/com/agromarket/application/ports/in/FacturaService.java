package com.agromarket.application.ports.in;

import com.agromarket.interfaces.rest.response.FacturaResponse;

public interface FacturaService {
    FacturaResponse getByPedidoId(Long pedidoId, Long solicitanteId);

    FacturaResponse getById(Long id, Long solicitanteId);

    java.util.List<FacturaResponse> getMisFacturas(Long compradorId);

    byte[] getFacturaPdf(Long id, Long solicitanteId);
}
