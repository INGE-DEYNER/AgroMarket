package com.agromarket.interfaces.rest.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.EstadoPago;
import com.agromarket.domain.models.enums.MetodoPago;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagoResponse {
    private Long id;
    private Long pedidoId;
    private BigDecimal monto;
    private MetodoPago metodoPago;
    private EstadoPago estado;
    private String referenciaPasarela;
    private LocalDateTime fechaPago;
}
