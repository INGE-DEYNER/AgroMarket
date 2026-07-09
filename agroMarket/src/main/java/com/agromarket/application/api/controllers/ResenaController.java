package com.agromarket.application.api.controllers;

import java.util.List;

import com.agromarket.application.api.request.CrearResenaRequest;
import com.agromarket.application.api.request.ModerarResenaRequest;
import com.agromarket.application.api.response.ApiResponse;
import com.agromarket.application.api.response.ResenaResponse;
import com.agromarket.domain.ports.ResenaService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ResenaController {
    private final ResenaService resenaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<ResenaResponse>> crear(@Valid @RequestBody CrearResenaRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.<ResenaResponse>builder().success(true).message("Reseña creada").data(resenaService.crear(request, principal.getUserId())).build());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<ApiResponse<List<ResenaResponse>>> getByProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(ApiResponse.<List<ResenaResponse>>builder().success(true).message("Reseñas recuperadas").data(resenaService.getByProducto(productoId)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPRADOR','ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id, @AuthenticationPrincipal JwtUserPrincipal principal) {
        resenaService.eliminar(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Reseña eliminada").build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResenaResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.<List<ResenaResponse>>builder()
                .success(true)
                .message("Reseñas listadas")
                .data(resenaService.getAll())
                .build());
    }

    @PutMapping("/{id}/moderar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> moderar(@PathVariable Long id, @RequestBody ModerarResenaRequest request, @AuthenticationPrincipal JwtUserPrincipal principal) {
        if (!request.isAprobada()) {
            resenaService.eliminar(id, principal.getUserId());
        }
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Moderación procesada").build());
    }
}
