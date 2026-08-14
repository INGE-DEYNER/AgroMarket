package com.agromarket.application.dto.response.payment;

import java.math.BigDecimal;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa un reporte financiero.
 * Contiene estadísticas sobre transacciones y pagos en el sistema.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReportResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalTrust;
    private long totalTransactions;
    private Map<String, Long> transactionsByStatus;
    private Map<String, BigDecimal> amountByStatus;
    private Map<String, Long> transactionsByMethod;
    private Map<String, BigDecimal> amountByMethod;
}
