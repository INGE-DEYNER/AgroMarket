package com.agromarket.application.adapters.api.response.admin;

import java.math.BigDecimal;

/**
 * Ingresos agregados de un mes, para la gráfica "Ingresos 6 Meses" del
 * panel de administración.
 */
public record IngresosMesResponse(
                String mes,
                String etiqueta,
                BigDecimal total) {
}