package com.agromarket.interfaces.rest.controllers;

import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.application.ports.in.CuponDescuentoService;
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
    private final com.agromarket.infrastructure.persistence.sql.repositories.CuponDescuentoRepository cuponRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>>> listarCupones(
            @AuthenticationPrincipal JwtUserPrincipal principal) {
        List<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento> cupones = cuponService.obtenerCuponesUsuario(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<List<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>>builder()
                .success(true)
                .message("Cupones recuperados")
                .data(cupones)
                .build());
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<List<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.<List<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>>builder()
                .success(true)
                .message("Todos los cupones recuperados")
                .data(cuponRepository.findAll())
                .build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>> crear(
            @RequestBody com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento cupon) {
        if (cupon.getFechaExpiracion() == null) {
            cupon.setFechaExpiracion(java.time.LocalDateTime.now().plusDays(30));
        }
        return ResponseEntity.ok(ApiResponse.<com.agromarket.infrastructure.persistence.sql.entities.CuponDescuento>builder()
                .success(true)
                .message("Cupón creado exitosamente")
                .data(cuponRepository.save(cupon))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        cuponRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Cupón eliminado exitosamente")
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

