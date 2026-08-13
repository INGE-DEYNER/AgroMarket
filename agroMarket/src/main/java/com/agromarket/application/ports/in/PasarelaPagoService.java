package com.agromarket.application.ports.in;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.domain.models.Pedido;

import java.util.Map;

public interface PasarelaPagoService {
    PagoIniciadoDTO iniciarPago(Pedido pedido);
    boolean confirmarPago(String referencia, Map<String, Object> webhookPayload);
}
