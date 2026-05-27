package com.agromarket.domain.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Mensaje {
    private Long id;
    private Usuario remitente;
    private Usuario destinatario;
    private String contenido;
    private boolean leido = false;
    private LocalDateTime fechaEnvio;

    public void marcarComoLeido() {
        this.leido = true;
    }
}
