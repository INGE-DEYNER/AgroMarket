package com.agromarket.interfaces.rest.request;

import java.math.BigDecimal;

import com.agromarket.domain.models.enums.TipoFruta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CrearProductoRequest {
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotNull(message = "La cantidad disponible es obligatoria")
    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer cantidadDisponible;

    @Size(max = 500, message = "La URL de la imagen no puede exceder 500 caracteres")
    @Pattern(regexp = "^$|^https?://.*", message = "La URL debe ser válida (http o https)")
    private String imagenUrl;

    @NotNull(message = "El tipo de fruta es obligatorio")
    private TipoFruta tipoFruta;

    private boolean enPromocion;
    private Integer cantidadMinimaMayorista;
    private BigDecimal precioMayorista;
}
