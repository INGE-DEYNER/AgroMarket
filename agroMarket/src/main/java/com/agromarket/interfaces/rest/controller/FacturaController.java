package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.FacturaResponse;
import com.agromarket.application.service.FacturaService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {
    private final FacturaService facturaService;

    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<FacturaResponse>> getByPedidoId(@PathVariable Long pedidoId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getByPedidoId(pedidoId, principal.getUserId())).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<FacturaResponse>> getById(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getById(id, principal.getUserId())).build());
    }
}
