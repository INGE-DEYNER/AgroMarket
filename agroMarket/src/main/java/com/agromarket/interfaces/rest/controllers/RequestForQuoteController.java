package com.agromarket.interfaces.rest.controllers;

import java.util.List;

import com.agromarket.application.dto.request.rfq.CreateQuoteOfferRequest;
import com.agromarket.application.dto.request.rfq.CreateRequestForQuoteRequest;
import com.agromarket.application.dto.response.rfq.QuoteOfferResponse;
import com.agromarket.application.dto.response.rfq.RequestForQuoteResponse;
import com.agromarket.application.ports.in.RequestForQuoteService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import com.agromarket.shared.ApiResponse;

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

/**
 * Controlador REST para la gestión de solicitudes de cotización (Request for Quote).
 * Permite a los compradores crear solicitudes y a los productores enviar ofertas.
 * 
 * @author AgroMarket Team
 */
@RestController
@RequestMapping("/api/request-for-quote")
@RequiredArgsConstructor
@Slf4j
public class RequestForQuoteController {
    private final RequestForQuoteService requestForQuoteService;

    /**
     * Crea una nueva solicitud de cotización.
     * Solo accesible para usuarios con rol BUYER.
     * 
     * @param request datos de la solicitud de cotización
     * @param principal usuario autenticado
     * @return ResponseEntity con la solicitud de cotización creada
     */
    @PostMapping
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<RequestForQuoteResponse>> create(@Valid @RequestBody CreateRequestForQuoteRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Creando Request for Quote para comprador {}", principal.getUserId());
        RequestForQuoteResponse response = requestForQuoteService.create(request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<RequestForQuoteResponse>builder()
                .success(true)
                .message("Solicitud de cotización creada exitosamente")
                .data(response)
                .build());
    }

    /**
     * Obtiene todas las solicitudes de cotización activas.
     * Solo accesible para usuarios con rol PRODUCER.
     * 
     * @return ResponseEntity con la lista de solicitudes activas
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('PRODUCER')")
    public ResponseEntity<ApiResponse<List<RequestForQuoteResponse>>> getActive() {
        log.info("Obteniendo solicitudes de cotización activas");
        List<RequestForQuoteResponse> response = requestForQuoteService.getActive();
        return ResponseEntity.ok(ApiResponse.<List<RequestForQuoteResponse>>builder()
                .success(true)
                .message("Solicitudes de cotización activas obtenidas")
                .data(response)
                .build());
    }

    /**
     * Envía una oferta para una solicitud de cotización.
     * Solo accesible para usuarios con rol PRODUCER.
     * 
     * @param id ID de la solicitud de cotización
     * @param request datos de la oferta
     * @param principal usuario autenticado
     * @return ResponseEntity con la oferta creada
     */
    @PostMapping("/{id}/offer")
    @PreAuthorize("hasRole('PRODUCER')")
    public ResponseEntity<ApiResponse<QuoteOfferResponse>> offer(@PathVariable Long id, @Valid @RequestBody CreateQuoteOfferRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Productor {} enviando oferta para RFQ {}", principal.getUserId(), id);
        QuoteOfferResponse response = requestForQuoteService.offer(id, request, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<QuoteOfferResponse>builder()
                .success(true)
                .message("Oferta enviada exitosamente")
                .data(response)
                .build());
    }

    /**
     * Obtiene las solicitudes de cotización creadas por el comprador autenticado.
     * Solo accesible para usuarios con rol BUYER.
     * 
     * @param principal usuario autenticado
     * @return ResponseEntity con la lista de solicitudes del usuario
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<List<RequestForQuoteResponse>>> getMyRequests(@AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Obteniendo solicitudes de cotización creadas por comprador {}", principal.getUserId());
        List<RequestForQuoteResponse> response = requestForQuoteService.getMyRequests(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<RequestForQuoteResponse>>builder()
                .success(true)
                .message("Mis solicitudes de cotización recuperadas")
                .data(response)
                .build());
    }

    /**
     * Acepta una oferta para una solicitud de cotización.
     * Solo accesible para usuarios con rol BUYER.
     * 
     * @param offerId ID de la oferta a aceptar
     * @param principal usuario autenticado
     * @return ResponseEntity con confirmación
     */
    @PutMapping("/offers/{offerId}/accept")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ApiResponse<Void>> acceptOffer(@PathVariable Long offerId, @AuthenticationPrincipal JwtUserPrincipal principal) {
        log.info("Comprador {} aceptando oferta {}", principal.getUserId(), offerId);
        requestForQuoteService.acceptOffer(offerId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Oferta aceptada exitosamente, se ha creado el pedido correspondiente")
                .build());
    }
}
