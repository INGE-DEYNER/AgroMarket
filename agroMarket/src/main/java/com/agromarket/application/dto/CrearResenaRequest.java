package com.agromarket.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearResenaRequest {
    @NotNull
    private Long productoId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer calificacion;

    @NotBlank
    private String comentario;
}
