package com.agromarket.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer cantidadDisponible;
    private String imagenUrl;
    private TipoFruta tipoFruta;
    private Productor productor;
    private boolean enPromocion;
    @Builder.Default
    private boolean activo = true;
    private LocalDateTime fechaCreacion;

    public boolean estaDisponible() {
        return activo && cantidadDisponible != null && cantidadDisponible > 0;
    }

    public void decrementarStock(int cantidad) {
        if (cantidadDisponible == null || cantidadDisponible < cantidad) {
            throw new IllegalArgumentException("No hay stock suficiente para la operación");
        }
        cantidadDisponible -= cantidad;
    }

    public double calcularCalificacionPromedio(List<Resena> resenas) {
        if (resenas == null || resenas.isEmpty()) {
            return 0.0;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (Resena resena : resenas) {
            total = total.add(BigDecimal.valueOf(resena.getCalificacion()));
        }
        return total.divide(BigDecimal.valueOf(resenas.size()), 2, RoundingMode.HALF_UP).doubleValue();
    }
}
