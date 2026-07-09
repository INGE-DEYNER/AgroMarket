package com.agromarket.application.api.request;

import java.math.BigDecimal;

import com.agromarket.domain.models.enums.TipoFruta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarProductoRequest {
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer cantidadDisponible;

    @Size(max = 500, message = "La URL de la imagen no puede exceder 500 caracteres")
    @Pattern(regexp = "^$|^https?://.*", message = "La URL debe ser válida (http o https)")
    private String imagenUrl;

    private TipoFruta tipoFruta;
    private Boolean enPromocion;
    private Boolean activo;
    private Integer cantidadMinimaMayorista;
    private BigDecimal precioMayorista;
}
