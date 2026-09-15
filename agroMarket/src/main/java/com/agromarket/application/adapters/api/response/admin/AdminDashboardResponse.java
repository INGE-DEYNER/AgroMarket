package com.agromarket.application.adapters.api.response.admin;

import java.math.BigDecimal;
import java.util.List;

/**
 * Payload de GET /api/v1/admins/dashboard (llamado por el frontend como
 * /admin/dashboard). Los nombres de campo coinciden con las llaves que
 * Admin.jsx lee de dashboardData: usuariosTotales, productores,
 * productosPublicados, pedidosTotales, ingresos, pedidosEntregados,
 * pedidosEnCamino, pedidosPendientes, pedidosCancelados, ventasHoy,
 * nuevosUsuarios, nuevosProductores, topProductores, ingresosPorMes.
 */
public record AdminDashboardResponse(
                long usuariosTotales,
                long productores,
                long productosPublicados,
                long pedidosTotales,
                BigDecimal ingresos,
                long pedidosEntregados,
                long pedidosEnCamino,
                long pedidosPendientes,
                long pedidosCancelados,
                BigDecimal ventasHoy,
                long nuevosUsuarios,
                long nuevosProductores,
                List<TopProductorResponse> topProductores,
                List<IngresosMesResponse> ingresosPorMes) {
}