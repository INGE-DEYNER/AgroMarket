package com.agromarket.interfaces.rest.controller;

import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.service.AdminService;
import com.agromarket.application.service.ProductoService;
import com.agromarket.application.service.ResenaService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.infrastructure.security.IdEncryptionUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminController {
    private final AdminService adminService;
    private final ProductoService productoService;
    private final ResenaService resenaService;
    private final IdEncryptionUtil idEncryptionUtil;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.<AdminDashboardResponse>builder().success(true).message("Dashboard recuperado").data(adminService.dashboard()).build());
    }

    @GetMapping("/pedidos")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> pedidos() {
        return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Pedidos recuperados").data(adminService.pedidos()).build());
    }

    @GetMapping("/usuarios")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> usuarios() {
        return ResponseEntity.ok(ApiResponse.<List<UsuarioResponse>>builder().success(true).message("Usuarios recuperados").data(adminService.usuarios()).build());
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarProducto(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        productoService.eliminar(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Producto eliminado").build());
    }

    @DeleteMapping("/resenas/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarResena(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        resenaService.eliminar(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Reseña eliminada").build());
    }

    @PutMapping("/productores/{encryptedId}/aprobar")
    public ResponseEntity<ApiResponse<Void>> aprobarProductor(@PathVariable String encryptedId) {
        Long id = idEncryptionUtil.decryptId(encryptedId);
        adminService.aprobarUsuario(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Productor aprobado exitosamente").build());
    }

    @GetMapping("/productores/pendientes")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> productoresPendientes() {
        List<UsuarioResponse> pendientes = adminService.productoresPendientes();
        pendientes.forEach(p -> p.setIdEncriptado(idEncryptionUtil.encryptId(p.getId())));
        return ResponseEntity.ok(ApiResponse.<List<UsuarioResponse>>builder()
                .success(true)
                .message("Productores pendientes recuperados")
                .data(pendientes)
                .build());
    }

    @DeleteMapping("/productores/{encryptedId}/rechazar")
    public ResponseEntity<ApiResponse<Void>> rechazarProductor(
            @PathVariable String encryptedId,
            @RequestParam(required = false) String motivo) {
        Long id = idEncryptionUtil.decryptId(encryptedId);
        adminService.rechazarProductor(id, motivo);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Productor rechazado exitosamente")
                .build());
    }
}
