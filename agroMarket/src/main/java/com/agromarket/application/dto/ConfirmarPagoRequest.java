package com.agromarket.application.dto;

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
public class ConfirmarPagoRequest {
    @NotNull
    private Long pagoId;

    @NotBlank
    private String referencia;

    @NotBlank
    private String estado; // e.g. APROBADO, RECHAZADO
}
