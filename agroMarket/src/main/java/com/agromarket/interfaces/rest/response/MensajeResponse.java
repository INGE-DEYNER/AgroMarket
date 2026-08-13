package com.agromarket.interfaces.rest.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeResponse {
    private Long id;
    private Long remitenteId;
    private String remitenteNombre;
    private Long destinatarioId;
    private String contenido;
    private boolean leido;
    private LocalDateTime fechaEnvio;
}
