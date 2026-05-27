package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.FacturaResponse;
import com.agromarket.application.service.FacturaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {
    private final FacturaService facturaService;

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<ApiResponse<FacturaResponse>> getByPedidoId(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getByPedidoId(pedidoId)).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacturaResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getById(id)).build());
    }
}
