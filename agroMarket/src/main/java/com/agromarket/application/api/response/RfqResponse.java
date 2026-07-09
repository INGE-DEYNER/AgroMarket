package com.agromarket.application.api.response;

import java.time.LocalDateTime;
import java.util.List;

import com.agromarket.domain.models.enums.TipoFruta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqResponse {
    private Long id;
    private Long compradorId;
    private String compradorNombre;
    private TipoFruta tipoFruta;
    private Double cantidadRequerida;
    private String descripcion;
    private LocalDateTime fechaLimite;
    private boolean activo;
    private LocalDateTime fechaCreacion;
    private List<RfqOfertaResponse> ofertas;
}
