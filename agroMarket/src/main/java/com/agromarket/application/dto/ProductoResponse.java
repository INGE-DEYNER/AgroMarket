package com.agromarket.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.model.TipoFruta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer cantidadDisponible;
    private String imagenUrl;
    private TipoFruta tipoFruta;
    private Long productorId;
    private String productorNombre;
    private boolean enPromocion;
    private boolean activo;
    private LocalDateTime fechaCreacion;
    private double calificacionPromedio;
    private long totalResenas;
}
