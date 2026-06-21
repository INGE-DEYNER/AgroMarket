package com.agromarket.application.service;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import java.util.Map;

public interface PasarelaPagoService {
    PagoIniciadoDTO iniciarPago(PedidoEntity pedido);
    boolean confirmarPago(String referencia, Map<String, Object> webhookPayload);
}
