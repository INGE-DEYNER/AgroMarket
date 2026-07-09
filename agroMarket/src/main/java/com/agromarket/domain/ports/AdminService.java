package com.agromarket.domain.ports;

import java.util.List;

import com.agromarket.application.api.response.AdminDashboardResponse;
import com.agromarket.application.api.response.PagoResponse;
import com.agromarket.application.api.response.PedidoResponse;
import com.agromarket.application.api.response.UsuarioResponse;

public interface AdminService {
    AdminDashboardResponse dashboard();

    List<PedidoResponse> pedidos();

    com.agromarket.application.api.response.PageResponse<UsuarioResponse> usuarios(int page, int size, String search);

    void aprobarUsuario(Long id);

    List<UsuarioResponse> productoresPendientes();

    void rechazarProductor(Long id, String motivo);

    byte[] getReportePdf();

    void toggleVerificarProductor(Long id);

    List<UsuarioResponse> usuariosPendientes();

    void rechazarUsuario(Long id, String motivo);

    List<PagoResponse> getPagosFideicomiso();

    void liberarPago(Long pagoId);

    void reembolsarPago(Long pagoId);

    com.agromarket.application.api.response.PageResponse<com.agromarket.application.api.response.ProductoResponse> productos(int page, int size, String search);

    com.agromarket.application.api.response.ReporteFinanzasResponse getReporteFinanzas();

    com.agromarket.application.api.response.ReporteLogisticaResponse getReporteLogistica();
}
