package com.agromarket.application.dto;

import java.time.LocalDateTime;
import com.agromarket.domain.model.TipoFruta;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqRequest {
    @NotNull(message = "El tipo de fruta es obligatorio")
    private TipoFruta tipoFruta;

    @NotNull(message = "La cantidad requerida es obligatoria")
    @Positive(message = "La cantidad debe ser mayor que cero")
    private Double cantidadRequerida;

    private String descripcion;

    @NotNull(message = "La fecha límite es obligatoria")
    private LocalDateTime fechaLimite;
}
