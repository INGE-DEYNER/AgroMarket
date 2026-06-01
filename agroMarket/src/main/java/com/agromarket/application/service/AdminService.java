package com.agromarket.application.service;

import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;

public interface AdminService {
    AdminDashboardResponse dashboard();

    List<PedidoResponse> pedidos();

    List<UsuarioResponse> usuarios();

    void aprobarUsuario(Long id);
}
