package com.agromarket.application.dto.response.shipping;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa un reporte de logística.
 * Contiene estadísticas sobre los envíos en el sistema.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogisticsReportResponse {
    private long totalShipments;
    private Map<String, Long> shipmentsByStatus;
    private Map<String, Long> shipmentsByCarrier;
}
