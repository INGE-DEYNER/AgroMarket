package com.agromarket.application.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.TipoFruta;

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
    private Integer stock;
    private String imagenUrl;
    private TipoFruta tipoFruta;
    private Long productorId;
    private String productorNombre;
    private boolean enPromocion;
    private boolean activo;
    private LocalDateTime fechaCreacion;
    private Integer cantidadMinimaMayorista;
    private BigDecimal precioMayorista;
    private double calificacionPromedio;
    private long totalResenas;
    private boolean productorVerificado;
    private Integer totalVendido;
    private BigDecimal precioPromocion;
    private LocalDateTime fechaFinPromocion;
    private Integer cantMinMayorista;
    private String categoria;
}
