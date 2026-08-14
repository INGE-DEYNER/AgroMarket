package com.agromarket.application.dto.response.admin;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa el dashboard del administrador.
 * Contiene estadísticas generales del sistema.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal revenue;
}
