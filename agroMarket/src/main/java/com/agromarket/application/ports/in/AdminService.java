package com.agromarket.application.ports.in;

import java.util.List;

import com.agromarket.interfaces.rest.response.AdminDashboardResponse;
import com.agromarket.interfaces.rest.response.PagoResponse;
import com.agromarket.interfaces.rest.response.PedidoResponse;
import com.agromarket.interfaces.rest.response.UsuarioResponse;

public interface AdminService {
    AdminDashboardResponse dashboard();

    List<PedidoResponse> pedidos();

    com.agromarket.interfaces.rest.response.PageResponse<UsuarioResponse> usuarios(int page, int size, String search);

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

    com.agromarket.interfaces.rest.response.PageResponse<com.agromarket.interfaces.rest.response.ProductoResponse> productos(int page, int size, String search);

    com.agromarket.interfaces.rest.response.ReporteFinanzasResponse getReporteFinanzas();

    com.agromarket.interfaces.rest.response.ReporteLogisticaResponse getReporteLogistica();
}
