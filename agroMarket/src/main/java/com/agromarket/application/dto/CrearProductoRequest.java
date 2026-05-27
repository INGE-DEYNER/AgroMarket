package com.agromarket.application.dto;

import java.math.BigDecimal;

import com.agromarket.domain.model.TipoFruta;

import jakarta.validation.constraints.DecimalMin;
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
public class CrearProductoRequest {
    @NotBlank
    private String nombre;

    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal precio;

    @NotNull
    @Min(0)
    private Integer cantidadDisponible;

    private String imagenUrl;

    @NotNull
    private TipoFruta tipoFruta;

    private boolean enPromocion;
}
