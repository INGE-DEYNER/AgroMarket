package com.agromarket.interfaces.rest.controller;

import java.util.List;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.ActualizarEnvioRequest;
import com.agromarket.application.dto.EnvioResponse;
import com.agromarket.application.service.EnvioService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/envios")
@RequiredArgsConstructor
public class EnvioController {
    private final EnvioService envioService;

    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<EnvioResponse>> getByPedidoId(@PathVariable Long pedidoId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<EnvioResponse>builder().success(true).message("Envío recuperado").data(envioService.getByPedidoId(pedidoId, principal.getUserId())).build());
    }

    @GetMapping("/mis-envios")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<EnvioResponse>>> misEnvios(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<EnvioResponse>>builder().success(true).message("Envíos listados").data(envioService.getMisEnvios(principal.getUserId())).build());
    }

    @GetMapping("/mis-despachos")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<EnvioResponse>>> misDespachos(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<List<EnvioResponse>>builder().success(true).message("Despachos listados").data(envioService.getMisDespachos(principal.getUserId())).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<EnvioResponse>> actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarEnvioRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<EnvioResponse>builder().success(true).message("Envío actualizado").data(envioService.actualizar(id, request, principal.getUserId())).build());
    }
}
