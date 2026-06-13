package com.agromarket.application.dto;

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
public class RfqOfertaResponse {
    private Long id;
    private Long rfqId;
    private Long productorId;
    private String productorNombre;
    private BigDecimal precioPropuesto;
    private String comentarios;
    private boolean aceptada;
    private LocalDateTime fechaCreacion;
}
