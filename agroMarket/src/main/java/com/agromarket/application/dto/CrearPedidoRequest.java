package com.agromarket.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearPedidoRequest {
    @NotNull
    private Long productoId;

    @NotNull
    @Min(1)
    private Integer cantidad;
}
