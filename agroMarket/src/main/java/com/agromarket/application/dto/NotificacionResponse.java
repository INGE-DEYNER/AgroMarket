package com.agromarket.application.dto;

import java.time.LocalDateTime;

import com.agromarket.domain.model.TipoNotificacion;

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
