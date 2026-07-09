package com.agromarket.domain.ports;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.application.persistence.sql.entities.PedidoEntity;

import java.util.Map;

public interface PasarelaPagoService {
    PagoIniciadoDTO iniciarPago(PedidoEntity pedido);
    boolean confirmarPago(String referencia, Map<String, Object> webhookPayload);
}
