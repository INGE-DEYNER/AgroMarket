package com.agromarket.domain.services;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.application.persistence.sql.entities.PagoEntity;
import com.agromarket.application.persistence.sql.entities.PedidoEntity;
import com.agromarket.application.persistence.sql.repositories.PagoJpaRepository;
import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.models.enums.MetodoPago;
import com.agromarket.domain.ports.PasarelaPagoService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasarelaPagoServiceImpl implements PasarelaPagoService {

    private final PagoJpaRepository pagoJpaRepository;

    @Override
    @Transactional
    public PagoIniciadoDTO iniciarPago(PedidoEntity pedido) {
        String referencia = "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        PagoEntity pago = PagoEntity.builder()
                .pedido(pedido)
                .monto(pedido.getTotal())
                .estado(EstadoPago.PENDIENTE)
                .metodoPago(MetodoPago.PSE)
                .referenciaPasarela(referencia)
                .build();
        pago = pagoJpaRepository.save(pago);

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
