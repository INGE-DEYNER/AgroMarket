package com.agromarket.domain.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    private Long id;
    private Usuario destinatario;
    private TipoNotificacion tipo;
    private String contenido;
    @Builder.Default
    private boolean leida = false;
    private LocalDateTime fecha;

    public void marcarComoLeida() {
        this.leida = true;
    }
}
