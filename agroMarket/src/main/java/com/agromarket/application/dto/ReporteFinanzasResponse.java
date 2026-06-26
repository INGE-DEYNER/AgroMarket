package com.agromarket.application.dto;

import java.math.BigDecimal;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteFinanzasResponse {
    private BigDecimal totalIngresos;
    private BigDecimal totalFideicomiso;
    private long totalTransacciones;
    private Map<String, Long> transaccionesPorEstado;
    private Map<String, BigDecimal> montoPorEstado;
    private Map<String, Long> transaccionesPorMetodo;
    private Map<String, BigDecimal> montoPorMetodo;
}
