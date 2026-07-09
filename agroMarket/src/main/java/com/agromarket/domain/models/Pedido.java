package com.agromarket.domain.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.models.enums.EstadoPedido;

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
public class Pedido {
    private Long id;
    private Comprador comprador;
    private Producto producto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private EstadoPedido estado;
    private LocalDateTime fechaCreacion;
    private String checkoutId;

    public void avanzarEstado() {
        if (estado == EstadoPedido.PENDIENTE) {
            estado = EstadoPedido.ENVIADO;
            return;
        }
        if (estado == EstadoPedido.ENVIADO) {
            estado = EstadoPedido.ENTREGADO;
            return;
        }
        throw new EstadoPedidoInvalidoException("El pedido no puede avanzar desde el estado actual");
    }

    public void cancelar() {
        if (estado != EstadoPedido.PENDIENTE) {
            throw new EstadoPedidoInvalidoException("Solo se puede cancelar un pedido pendiente");
        }
        estado = EstadoPedido.CANCELADO;
    }

    public BigDecimal calcularTotal() {
        if (cantidad == null || precioUnitario == null) {
            return BigDecimal.ZERO;
        }
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
