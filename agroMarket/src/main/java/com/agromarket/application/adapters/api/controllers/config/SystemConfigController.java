package com.agromarket.application.adapters.api.controllers.config;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.domain.ports.out.config.AppConfigPort;

import lombok.RequiredArgsConstructor;

/**
 * Configuración global del sistema.
 *
 * GET /api/v1/config/system                 (público: el frontend sondea el
 *                                           estado del modo mantenimiento
 *                                           cada 15 s y muestra el aviso).
 * PUT /api/v1/config/system/mantenimiento   (solo ADMIN: activa/desactiva).
 *
 * El flag vive en app_config (base de datos), de modo que en cuanto el
 * administrador lo active, TODOS los clientes lo ven en el siguiente sondeo,
 * sin importar el navegador.
 */
@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final AppConfigPort appConfigPort;

    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> system() {
        return ResponseEntity.ok(buildPayload());
    }

    @PutMapping("/system/mantenimiento")
    public ResponseEntity<Map<String, Object>> setMantenimiento(
            @RequestBody Map<String, Object> body) {

        Object valor = body == null ? null : body.get("activo");
        boolean activo = Boolean.TRUE.equals(valor)
                || "true".equalsIgnoreCase(String.valueOf(valor));

        appConfigPort.setValor(
                AppConfigPort.CLAVE_MODO_MANTENIMIENTO,
                activo ? BigDecimal.ONE : BigDecimal.ZERO);

        return ResponseEntity.ok(buildPayload());
    }

    /**
     * Alias POST del toggle de mantenimiento.
     * Algunos despliegues/proxies convierten o bloquean PUT y el panel de
     * administración terminaba mostrando "Not Found". El frontend intenta
     * PUT primero y reintenta con POST automáticamente.
     */
    @PostMapping("/system/mantenimiento")
    public ResponseEntity<Map<String, Object>> setMantenimientoPost(
            @RequestBody Map<String, Object> body) {
        return setMantenimiento(body);
    }

    private Map<String, Object> buildPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("mantenimiento", isMantenimientoActivo());
        return payload;
    }

    private boolean isMantenimientoActivo() {
        return appConfigPort
                .getValor(AppConfigPort.CLAVE_MODO_MANTENIMIENTO)
                .orElse(BigDecimal.ZERO)
                .compareTo(BigDecimal.ONE) == 0;
    }
}
