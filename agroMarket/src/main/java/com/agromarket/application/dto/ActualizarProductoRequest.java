package com.agromarket.application.dto;

import java.math.BigDecimal;

import com.agromarket.domain.model.TipoFruta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarProductoRequest {
    private String nombre;
    private String descripcion;

    @DecimalMin(value = "0.01")
    private BigDecimal precio;

    @Min(0)
    private Integer cantidadDisponible;

    private String imagenUrl;
    private TipoFruta tipoFruta;
    private Boolean enPromocion;
    private Boolean activo;
}
