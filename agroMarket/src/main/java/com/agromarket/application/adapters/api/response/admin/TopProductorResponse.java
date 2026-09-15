package com.agromarket.application.adapters.api.response.admin;

import java.math.BigDecimal;

/**
 * Fila del ranking "Top Productores" del dashboard administrativo.
 */
public record TopProductorResponse(
                Long productorId,
                String nombre,
                long pedidos,
                BigDecimal totalVentas) {
}