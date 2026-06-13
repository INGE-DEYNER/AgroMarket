package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.dto.PagoResponse;

public interface AdminService {
    AdminDashboardResponse dashboard();

    List<PedidoResponse> pedidos();

    List<UsuarioResponse> usuarios();

    void aprobarUsuario(Long id);

    List<UsuarioResponse> productoresPendientes();

    void rechazarProductor(Long id, String motivo);

    byte[] getReportePdf();

    void toggleVerificarProductor(Long id);

    List<PagoResponse> getPagosFideicomiso();

    void liberarPago(Long pagoId);

    void reembolsarPago(Long pagoId);
}
