package com.agromarket.application.usecases;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.domain.models.Pago;
import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.ports.out.PaymentRepositoryPort;
import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.models.enums.MetodoPago;
import com.agromarket.application.ports.in.PasarelaPagoService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasarelaPagoServiceImpl implements PasarelaPagoService {

    private final PaymentRepositoryPort paymentRepositoryPort;

    @Override
    @Transactional
    public PagoIniciadoDTO iniciarPago(Pedido pedido) {
        String referencia = "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        Pago pago = Pago.builder()
                .pedido(pedido)
                .monto(pedido.getTotal())
                .estado(EstadoPago.PENDIENTE)
                .metodoPago(MetodoPago.PSE)
                .referenciaPasarela(referencia)
                .build();
        pago = paymentRepositoryPort.save(pago);

        String redirectUrl = "/pago-pasarela?pagoId=" + pago.getId() + "&referencia=" + referencia;

        return PagoIniciadoDTO.builder()
                .referencia(referencia)
                .redirectUrl(redirectUrl)
                .build();
    }

    @Override
    public boolean confirmarPago(String referencia, Map<String, Object> webhookPayload) {
        return true;
    }
}
