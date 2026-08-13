package com.agromarket.interfaces.rest.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqOfertaRequest {
    @NotNull(message = "El precio propuesto es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio propuesto debe ser mayor a cero")
    private BigDecimal precioPropuesto;

    private String comentarios;
}
