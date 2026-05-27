package com.agromarket.application.service;

import com.agromarket.application.dto.FacturaResponse;

public interface FacturaService {
    FacturaResponse getByPedidoId(Long pedidoId);

    FacturaResponse getById(Long id);
}
