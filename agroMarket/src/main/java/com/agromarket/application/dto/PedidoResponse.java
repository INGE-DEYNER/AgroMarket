package com.agromarket.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.model.EstadoPedido;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {
    private Long id;
    private String compradorNombre;
    private String productoNombre;
    private Long productoId;
    private String productorNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private EstadoPedido estado;
    private LocalDateTime fechaCreacion;
    private String checkoutId;
}
