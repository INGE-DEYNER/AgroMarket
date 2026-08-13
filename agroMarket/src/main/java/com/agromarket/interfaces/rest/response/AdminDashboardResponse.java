package com.agromarket.interfaces.rest.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsuarios;
    private long totalProductos;
    private long totalPedidos;
    private BigDecimal ingresos;
}
