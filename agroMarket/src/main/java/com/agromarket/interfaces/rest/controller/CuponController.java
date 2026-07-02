package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.service.CuponDescuentoService;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponDescuentoService cuponService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.agromarket.infrastructure.persistence.entity.CuponDescuento>>> listarCupones(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        List<com.agromarket.infrastructure.persistence.entity.CuponDescuento> cupones = cuponService.obtenerCuponesUsuario(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<com.agromarket.infrastructure.persistence.entity.CuponDescuento>>builder()
                .success(true)
                .message("Cupones recuperados")
                .data(cupones)
                .build());
    }

    @PostMapping("/validar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validarCupon(@RequestBody Map<String, Object> request) {
        if (request == null || !request.containsKey("codigo") || !request.containsKey("totalPedido") 
                || request.get("codigo") == null || request.get("totalPedido") == null) {
            return ResponseEntity.badRequest().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Código y totalPedido son requeridos")
                    .build());
        }
        String codigo = (String) request.get("codigo");
        BigDecimal totalPedido;
        try {
            totalPedido = new BigDecimal(request.get("totalPedido").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("totalPedido debe ser un número válido")
                    .build());
        }
        Map<String, Object> res = cuponService.validarCupon(codigo, totalPedido);
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(Boolean.TRUE.equals(res.get("valido")))
                .message((String) res.get("mensaje"))
                .data(res)
                .build());
    }
}

