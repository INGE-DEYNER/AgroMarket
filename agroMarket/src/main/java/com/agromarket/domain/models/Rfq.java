package com.agromarket.domain.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
public class Rfq {
    private Long id;
    private Usuario comprador;
    private TipoFruta tipoFruta;
    private Double cantidadRequerida;
    private String descripcion;
    private LocalDateTime fechaLimite;
    @Builder.Default
    private boolean activo = true;
    private LocalDateTime fechaCreacion;
    @Builder.Default
    private List<RfqOferta> ofertas = new ArrayList<>();
}
