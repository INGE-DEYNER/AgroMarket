package com.agromarket.application.api.controllers;

import com.agromarket.application.api.request.ProcesarPagoRequest;
import com.agromarket.application.api.response.ApiResponse;
import com.agromarket.application.api.response.PagoResponse;
import com.agromarket.domain.ports.PagoService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {
    private final PagoService pagoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<PagoResponse>> procesar(@Valid @RequestBody ProcesarPagoRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<PagoResponse>builder().success(true).message("Pago procesado").data(pagoService.procesar(request, principal.getUserId())).build());
    }

    @PostMapping("/iniciar")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<com.agromarket.application.api.response.IniciarPagoResponse>> iniciar(@Valid @RequestBody com.agromarket.application.api.request.IniciarPagoRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<com.agromarket.application.api.response.IniciarPagoResponse>builder().success(true).message("Pago iniciado").data(pagoService.iniciar(request, principal.getUserId())).build());
    }

    @PostMapping("/confirmar")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<PagoResponse>> confirmar(@Valid @RequestBody com.agromarket.application.api.request.ConfirmarPagoRequest request) {
        return ResponseEntity.ok(ApiResponse.<PagoResponse>builder().success(true).message("Pago confirmado").data(pagoService.confirmar(request)).build());
    }

    @GetMapping({"/pedido/{pedidoId}", "/{pedidoId}"})
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<PagoResponse>> getByPedidoId(@PathVariable Long pedidoId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<PagoResponse>builder().success(true).message("Pago recuperado").data(pagoService.getByPedidoId(pedidoId, principal.getUserId())).build());
    }
}
