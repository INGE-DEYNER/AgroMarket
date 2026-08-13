package com.agromarket.interfaces.rest.controllers;

import com.agromarket.interfaces.rest.response.ApiResponse;
import com.agromarket.infrastructure.persistence.sql.entities.TarjetaPago;
import com.agromarket.infrastructure.persistence.sql.entities.UsuarioEntity;
import com.agromarket.infrastructure.persistence.sql.repositories.TarjetaPagoRepository;
import com.agromarket.infrastructure.persistence.sql.repositories.UsuarioJpaRepository;
import com.agromarket.domain.models.enums.TipoTarjeta;
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
        if (numero == null) {
            throw new IllegalArgumentException("El número de tarjeta es obligatorio");
        }
        String numeroLimpio = numero.replaceAll("\\s", "");
        if (numeroLimpio.length() < 13 || numeroLimpio.length() > 19) {
            throw new IllegalArgumentException("Longitud de tarjeta inválida");
        }

        String ultimos4 = numeroLimpio.substring(numeroLimpio.length() - 4);
        TipoTarjeta tipo = detectarTipoTarjeta(numeroLimpio);

        Boolean predeterminada = (Boolean) body.getOrDefault("predeterminada", false);

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

    private TipoTarjeta detectarTipoTarjeta(String numero) {
        if (numero.startsWith("4")) return TipoTarjeta.VISA;
        if (numero.matches("^5[1-5].*") || numero.matches("^2(2[2-9]|[3-6]|7[01]).*")) return TipoTarjeta.MASTERCARD;
        if (numero.matches("^3[47].*")) return TipoTarjeta.AMEX;
        if (numero.matches("^3(?:0[0-5]|[68]).*")) return TipoTarjeta.DINERS;
        if (numero.startsWith("6011") || numero.startsWith("65")) return TipoTarjeta.DISCOVER;
        return TipoTarjeta.OTRO;
    }
}
