package com.agromarket.domain.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Resena {
    private Long id;
    private Comprador comprador;
    private Producto producto;
    private Integer calificacion;
    private String comentario;
    private LocalDateTime fecha;
}
