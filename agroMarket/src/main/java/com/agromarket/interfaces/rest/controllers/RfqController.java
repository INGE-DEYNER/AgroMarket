package com.agromarket.interfaces.rest.controllers;

import java.util.List;

import com.agromarket.interfaces.rest.request.RfqOfertaRequest;
import com.agromarket.interfaces.rest.request.RfqRequest;
import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.interfaces.rest.response.RfqOfertaResponse;
import com.agromarket.interfaces.rest.response.RfqResponse;
import com.agromarket.application.ports.in.RfqService;
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
@RequestMapping("/api/rfq")
@RequiredArgsConstructor
@Slf4j
public class RfqController {
    private final RfqService rfqService;

    @PostMapping
    @PreAuthorize("hasRole('COMPRADOR')")
    public ResponseEntity<ApiResponse<RfqResponse>> crear(@Valid @RequestBody RfqRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Creando RFQ para comprador {}", principal.getUserId());
        RfqResponse response = rfqService.crear(request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<RfqResponse>builder()
                .success(true)
                .message("Licitación creada exitosamente")
                .data(response)
                .build());
    }

    @GetMapping("/activas")
    @PreAuthorize("hasRole('PRODUCTOR')")
    public ResponseEntity<ApiResponse<List<RfqResponse>>> getActivas() {
        log.info("Obteniendo RFQs activas");
        List<RfqResponse> response = rfqService.getActivas();
        return ResponseEntity.ok(ApiResponse.<List<RfqResponse>>builder()
                .success(true)
                .message("Licitaciones activas obtenidas")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/ofertar")
    @PreAuthorize("hasRole('PRODUCTOR')")
    public ResponseEntity<ApiResponse<RfqOfertaResponse>> ofertar(@PathVariable Long id, @Valid @RequestBody RfqOfertaRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Productor {} enviando oferta para RFQ {}", principal.getUserId(), id);
        RfqOfertaResponse response = rfqService.ofertar(id, request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<RfqOfertaResponse>builder()
                .success(true)
                .message("Oferta enviada exitosamente")
                .data(response)
                .build());
    }

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasRole('COMPRADOR')")
    public ResponseEntity<ApiResponse<List<RfqResponse>>> getMisSolicitudes(@AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Obteniendo RFQs creadas por comprador {}", principal.getUserId());
        List<RfqResponse> response = rfqService.getMisSolicitudes(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<RfqResponse>>builder()
                .success(true)
                .message("Mis solicitudes recuperadas")
                .data(response)
                .build());
    }

    @PutMapping("/ofertas/{ofertaId}/aceptar")
    @PreAuthorize("hasRole('COMPRADOR')")
    public ResponseEntity<ApiResponse<Void>> aceptarOferta(@PathVariable Long ofertaId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Comprador {} aceptando oferta {}", principal.getUserId(), ofertaId);
        rfqService.aceptarOferta(ofertaId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Oferta aceptada exitosamente, se ha creado el pedido correspondiente")
                .build());
    }
}
