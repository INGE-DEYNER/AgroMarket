package com.agromarket.domain.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqOferta {
    private Long id;
    private Rfq rfq;
    private Usuario productor;
    private BigDecimal precioPropuesto;
    private String comentarios;
    @Builder.Default
    private boolean aceptada = false;
    private LocalDateTime fechaCreacion;
}
