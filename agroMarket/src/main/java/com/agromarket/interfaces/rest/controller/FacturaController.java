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
    @PreAuthorize("hasAnyRole('COMPRADOR','PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<FacturaResponse>> getByPedidoId(@PathVariable Long pedidoId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getByPedidoId(pedidoId, principal.getUserId())).build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPRADOR','PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<FacturaResponse>> getById(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<FacturaResponse>builder().success(true).message("Factura recuperada").data(facturaService.getById(id, principal.getUserId())).build());
    }

    @GetMapping("/mis-facturas")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<java.util.List<FacturaResponse>>> getMisFacturas(@AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<java.util.List<FacturaResponse>>builder().success(true).message("Facturas recuperadas").data(facturaService.getMisFacturas(principal.getUserId())).build());
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('COMPRADOR','PRODUCTOR','ADMINISTRADOR')")
    public ResponseEntity<org.springframework.core.io.Resource> getFacturaPdf(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        byte[] pdfBytes = facturaService.getFacturaPdf(id, principal.getUserId());
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(pdfBytes);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"factura-" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(resource);
    }
}
