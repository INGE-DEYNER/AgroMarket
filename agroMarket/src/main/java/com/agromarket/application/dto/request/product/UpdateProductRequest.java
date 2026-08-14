package com.agromarket.application.dto.request.product;

import java.math.BigDecimal;

import com.agromarket.domain.product.enums.FruitType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de solicitud para actualizar un producto existente.
 * Todos los campos son opcionales, se actualizarán solo los campos proporcionados.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String description;

    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal price;

    @Min(value = 0, message = "La cantidad no puede ser negativa")
    private Integer availableQuantity;

    @Size(max = 500, message = "La URL de la imagen no puede exceder 500 caracteres")
    @Pattern(regexp = "^$|^https?://.*", message = "La URL debe ser válida (http o https)")
    private String imageUrl;

    private FruitType fruitType;
    private Boolean onPromotion;
    private Boolean active;
    private Integer minimumWholesaleQuantity;
    private BigDecimal wholesalePrice;
}
