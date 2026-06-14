package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.service.CuponDescuentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponDescuentoService cuponService;

    @PostMapping("/validar")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validarCupon(@RequestBody Map<String, Object> request) {
        String codigo = (String) request.get("codigo");
        BigDecimal totalPedido = new BigDecimal(request.get("totalPedido").toString());
        Map<String, Object> res = cuponService.validarCupon(codigo, totalPedido);
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(Boolean.TRUE.equals(res.get("valido")))
                .message((String) res.get("mensaje"))
                .data(res)
                .build());
    }
}
