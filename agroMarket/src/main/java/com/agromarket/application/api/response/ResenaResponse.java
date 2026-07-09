package com.agromarket.application.api.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResenaResponse {
    private Long id;
    private String compradorNombre;
    private Integer calificacion;
    private String comentario;
    private LocalDateTime fecha;

    @Builder.Default
    private boolean aprobada = true;
}
