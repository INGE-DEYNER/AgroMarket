package com.agromarket.application.service.impl;

import com.agromarket.application.dto.PagoIniciadoDTO;
import com.agromarket.application.service.PasarelaPagoService;
import com.agromarket.domain.model.EstadoPago;
import com.agromarket.infrastructure.persistence.entity.PagoEntity;
import com.agromarket.infrastructure.persistence.entity.PedidoEntity;
import com.agromarket.infrastructure.persistence.repository.PagoJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@Primary
@Profile("!pse")
@RequiredArgsConstructor
@Slf4j
public class PasarelaPagoStub implements PasarelaPagoService {

    private final PagoJpaRepository pagoJpaRepository;

    @Override
    @Transactional
    public PagoIniciadoDTO iniciarPago(PedidoEntity pedido) {
        String referencia = "STUB-" + UUID.randomUUID().toString();
        
        PagoEntity pago = pagoJpaRepository.findByPedidoId(pedido.getId())
                .orElseGet(() -> PagoEntity.builder().pedido(pedido).build());
        
        pago.setMonto(pedido.getTotal());
        pago.setEstado(EstadoPago.EN_PROCESO);
        pago.setReferenciaPasarela(referencia);
        
        pagoJpaRepository.save(pago);
        
        String redirectUrl = "/api/pago/simular/" + referencia;
        
        log.info("Pago iniciado en PasarelaPagoStub para pedido ID {}. Referencia: {}", pedido.getId(), referencia);
        
        return PagoIniciadoDTO.builder()
                .referencia(referencia)
                .redirectUrl(redirectUrl)
                .build();
    }

    @Override
    public boolean confirmarPago(String referencia, Map<String, Object> webhookPayload) {
        if (referencia != null && referencia.startsWith("STUB-")) {
            log.info("Pago confirmado en PasarelaPagoStub para referencia: {}", referencia);
            return true;
        }
        log.warn("Referencia inválida para PasarelaPagoStub: {}", referencia);
        return false;
    }
}
