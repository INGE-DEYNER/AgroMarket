package com.agromarket.application.dto;

import com.agromarket.domain.model.MetodoPago;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IniciarPagoRequest {
    @NotNull
    private Long pedidoId;

    @NotNull
    private MetodoPago metodoPago;
}
