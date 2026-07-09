package com.agromarket.application.api.response;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.TipoNotificacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponse {
    private Long id;
    private TipoNotificacion tipo;
    private String contenido;
    private boolean leida;
    private LocalDateTime fecha;
}
