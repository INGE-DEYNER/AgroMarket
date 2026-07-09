package com.agromarket.application.api.request;

import com.agromarket.domain.models.enums.MetodoPago;

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
public class ProcesarPagoRequest {
    @NotNull
    private Long pedidoId;

    @NotNull
    private MetodoPago metodoPago;

    @NotBlank
    private String referenciaPasarela;
}
