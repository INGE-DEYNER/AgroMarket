package com.agromarket.application.service;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PasarelaPagoServiceImpl implements PasarelaPagoService {

    @Override
    public PagoIniciadoDTO iniciarPago(PedidoEntity pedido) {
        throw new UnsupportedOperationException("Pasarela de pago no configurada");
    }

    @Override
    public boolean confirmarPago(String referencia, Map<String, Object> webhookPayload) {
        throw new UnsupportedOperationException("Pasarela de pago no configurada");
    }
}
