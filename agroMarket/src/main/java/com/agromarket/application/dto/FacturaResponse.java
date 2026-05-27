package com.agromarket.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaResponse {
    private Long id;
    private String numeroFactura;
    private Long pedidoId;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal total;
    private LocalDateTime fechaEmision;
}
