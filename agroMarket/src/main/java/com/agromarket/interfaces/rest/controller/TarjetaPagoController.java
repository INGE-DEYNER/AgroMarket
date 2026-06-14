package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.domain.model.TipoTarjeta;
import com.agromarket.infrastructure.persistence.entity.TarjetaPago;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.TarjetaPagoRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tarjetas")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TarjetaPagoController {

    private final TarjetaPagoRepository tarjetaRepository;
    private final UsuarioJpaRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarTarjetas(@AuthenticationPrincipal JwtUserPrincipal principal) {
        List<TarjetaPago> tarjetas = tarjetaRepository.findByUsuarioIdAndActivaTrue(principal.getUserId());
        List<Map<String, Object>> data = new ArrayList<>();
        for (TarjetaPago t : tarjetas) {
            data.add(Map.of(
                "id", t.getId(),
                "tipoTarjeta", t.getTipoTarjeta().name(),
                "ultimosCuatroDigitos", t.getUltimosCuatroDigitos(),
                "predeterminada", t.isPredeterminada()
            ));
        }
        return ResponseEntity.ok(ApiResponse.<List<Map<String, Object>>>builder()
                .success(true)
                .message("Tarjetas recuperadas")
                .data(data)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> agregarTarjeta(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        UsuarioEntity usuario = usuarioRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String numero = (String) body.get("numero");
        String tipoStr = (String) body.get("tipoTarjeta");
        Boolean predeterminada = (Boolean) body.getOrDefault("predeterminada", false);

        String ultimos4 = "4242";
        if (numero != null && numero.length() >= 4) {
            ultimos4 = numero.substring(numero.length() - 4);
        }

        TipoTarjeta tipo = TipoTarjeta.VISA;
        if (tipoStr != null) {
            try {
                tipo = TipoTarjeta.valueOf(tipoStr.toUpperCase());
            } catch (Exception e) {
                // Default to VISA
            }
        }

        if (predeterminada) {
            List<TarjetaPago> existing = tarjetaRepository.findByUsuarioIdAndActivaTrue(principal.getUserId());
            for (TarjetaPago t : existing) {
                t.setPredeterminada(false);
                tarjetaRepository.save(t);
            }
        }

        TarjetaPago tarjeta = TarjetaPago.builder()
                .usuario(usuario)
                .tipoTarjeta(tipo)
                .ultimosCuatroDigitos(ultimos4)
                .tokenPasarela("tok_" + UUID.randomUUID().toString().substring(0, 8))
                .predeterminada(predeterminada)
                .activa(true)
                .build();

        TarjetaPago guardada = tarjetaRepository.save(tarjeta);

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Tarjeta agregada exitosamente")
                .data(Map.of(
                    "id", guardada.getId(),
                    "tipoTarjeta", guardada.getTipoTarjeta().name(),
                    "ultimosCuatroDigitos", guardada.getUltimosCuatroDigitos(),
                    "predeterminada", guardada.isPredeterminada()
                ))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarTarjeta(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @PathVariable Long id) {
        TarjetaPago tarjeta = tarjetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada"));

        if (!tarjeta.getUsuario().getId().equals(principal.getUserId())) {
            throw new IllegalArgumentException("No tienes permisos sobre esta tarjeta");
        }

        tarjeta.setActiva(false);
        tarjetaRepository.save(tarjeta);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Tarjeta eliminada exitosamente")
                .build());
    }
}
