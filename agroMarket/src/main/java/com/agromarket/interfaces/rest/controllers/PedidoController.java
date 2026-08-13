package com.agromarket.interfaces.rest.controllers;

import java.util.List;

import com.agromarket.interfaces.rest.request.CrearPedidoRequest;
import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.interfaces.rest.response.PedidoResponse;
import com.agromarket.application.ports.in.PedidoService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Slf4j
public class PedidoController {
    private final PedidoService pedidoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<PedidoResponse>> crear(@Valid @RequestBody CrearPedidoRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Creando pedido para comprador {}", principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<PedidoResponse>builder().success(true).message("Pedido creado").data(pedidoService.crear(request, principal.getUserId())).build());
    }

    @GetMapping("/mis-compras")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> misCompras(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Compras listadas").data(pedidoService.getMisCompras(principal.getUserId())).build());
    }

    @GetMapping("/mis-pedidos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> misPedidos(@AuthenticationPrincipal JwtUserPrincipal principal) {
        if (principal.getRol() == com.agromarket.domain.models.enums.RolUsuario.PRODUCTOR) {
            return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Ventas listadas").data(pedidoService.getMisVentas(principal.getUserId())).build());
        } else {
            return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Compras listadas").data(pedidoService.getMisCompras(principal.getUserId())).build());
        }
    }

    @GetMapping("/mis-ventas")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> misVentas(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Ventas listadas").data(pedidoService.getMisVentas(principal.getUserId())).build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<PedidoResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.<List<PedidoResponse>>builder().success(true).message("Pedidos listados").data(pedidoService.getAll()).build());
    }

    @PutMapping("/{id}/avanzar")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<PedidoResponse>> avanzar(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<PedidoResponse>builder().success(true).message("Pedido actualizado").data(pedidoService.avanzarEstado(id, principal.getUserId())).build());
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> cancelar(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        pedidoService.cancelar(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Pedido cancelado").build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PedidoResponse>> getById(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<PedidoResponse>builder().success(true).message("Pedido recuperado").data(pedidoService.getById(id, principal.getUserId())).build());
    }
}
