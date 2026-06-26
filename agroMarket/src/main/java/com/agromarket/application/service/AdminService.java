package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.dto.PagoResponse;

public interface AdminService {
    AdminDashboardResponse dashboard();

    List<PedidoResponse> pedidos();

    com.agromarket.application.dto.PageResponse<UsuarioResponse> usuarios(int page, int size, String search);

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

    com.agromarket.application.dto.PageResponse<com.agromarket.application.dto.ProductoResponse> productos(int page, int size, String search);

    void limpiarDatosFalsos();
}
