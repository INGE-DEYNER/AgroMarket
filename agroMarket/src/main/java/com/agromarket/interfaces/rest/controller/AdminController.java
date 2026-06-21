package com.agromarket.interfaces.rest.controller;

import java.util.List;

import com.agromarket.application.dto.AdminDashboardResponse;
import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.PedidoResponse;
import com.agromarket.application.dto.UsuarioResponse;
import com.agromarket.application.dto.PagoResponse;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        List<UsuarioResponse> list = adminService.usuarios();
        list.forEach(u -> u.setIdEncriptado(idEncryptionUtil.encryptId(u.getId())));
        return ResponseEntity.ok(ApiResponse.<List<UsuarioResponse>>builder().success(true).message("Usuarios recuperados").data(list).build());
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

    @GetMapping("/usuarios-pendientes")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> usuariosPendientes() {
        List<UsuarioResponse> pendientes = adminService.usuariosPendientes();
        pendientes.forEach(u -> u.setIdEncriptado(idEncryptionUtil.encryptId(u.getId())));
        return ResponseEntity.ok(ApiResponse.<List<UsuarioResponse>>builder()
                .success(true)
                .message("Usuarios pendientes recuperados")
                .data(pendientes)
                .build());
    }

    @PostMapping("/aprobar-usuario/{id}")
    public ResponseEntity<ApiResponse<Void>> aprobarUsuario(@PathVariable("id") String id) {
        Long decryptedId;
        try {
            decryptedId = idEncryptionUtil.decryptId(id);
            if (decryptedId == null) {
                throw new IllegalArgumentException("ID inválido");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("ID inválido", e);
        }
        adminService.aprobarUsuario(decryptedId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Usuario aprobado exitosamente")
                .build());
    }

    @PostMapping("/rechazar-usuario/{id}")
    public ResponseEntity<ApiResponse<Void>> rechazarUsuario(
            @PathVariable("id") String id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestParam(required = false) String motivo) {
        Long decryptedId;
        try {
            decryptedId = idEncryptionUtil.decryptId(id);
            if (decryptedId == null) {
                throw new IllegalArgumentException("ID inválido");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("ID inválido", e);
        }
        String motivoFinal = motivo;
        if (motivoFinal == null && body != null) {
            motivoFinal = body.get("motivo");
        }
        adminService.rechazarUsuario(decryptedId, motivoFinal);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Usuario rechazado exitosamente")
                .build());
    }

    @GetMapping("/reporte/pdf")
    public ResponseEntity<org.springframework.core.io.Resource> getReportePdf() {
        byte[] pdfBytes = adminService.getReportePdf();
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(pdfBytes);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte-mensual.pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }

    @PutMapping("/productores/{encryptedId}/verificar")
    public ResponseEntity<ApiResponse<Void>> toggleVerificarProductor(@PathVariable String encryptedId) {
        Long id = idEncryptionUtil.decryptId(encryptedId);
        adminService.toggleVerificarProductor(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Estado de verificación de productor actualizado")
                .build());
    }

    @GetMapping("/pagos/fideicomiso")
    public ResponseEntity<ApiResponse<List<PagoResponse>>> getPagosFideicomiso() {
        List<PagoResponse> pagos = adminService.getPagosFideicomiso();
        return ResponseEntity.ok(ApiResponse.<List<PagoResponse>>builder()
                .success(true)
                .message("Pagos en fideicomiso recuperados")
                .data(pagos)
                .build());
    }

    @PutMapping("/pagos/{id}/liberar")
    public ResponseEntity<ApiResponse<Void>> liberarPago(@PathVariable Long id) {
        adminService.liberarPago(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Fondos liberados exitosamente al productor")
                .build());
    }

    @PutMapping("/pagos/{id}/reembolsar")
    public ResponseEntity<ApiResponse<Void>> reembolsarPago(@PathVariable Long id) {
        adminService.reembolsarPago(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Fondos reembolsados exitosamente al comprador")
                .build());
    }
}
