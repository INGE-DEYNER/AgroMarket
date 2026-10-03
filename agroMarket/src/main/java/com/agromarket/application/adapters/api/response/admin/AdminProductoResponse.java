package com.agromarket.application.adapters.api.response.admin;

import java.math.BigDecimal;

/**
 * Producto con nombres en español tal como los consume la tabla de
 * productos del panel de administración (Admin.jsx espera
 * id/nombre/productor/precio/stock).
 */
public record AdminProductoResponse(
                Long id,
                String nombre,
                String productor,
                BigDecimal precio,
                Integer stock) {
}