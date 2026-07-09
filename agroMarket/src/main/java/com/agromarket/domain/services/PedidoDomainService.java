package com.agromarket.domain.services;


import com.agromarket.domain.exception.AccesoDenegadoException;
import com.agromarket.domain.exception.EstadoPedidoInvalidoException;
import com.agromarket.domain.exception.StockInsuficienteException;
import com.agromarket.domain.models.Pedido;
import com.agromarket.domain.models.Producto;
import com.agromarket.domain.models.Usuario;
import com.agromarket.domain.models.enums.EstadoPedido;

public class PedidoDomainService {
    public void validarStock(Producto producto, int cantidad) {
        if (producto == null || producto.getCantidadDisponible() == null || producto.getCantidadDisponible() < cantidad) {
            throw new StockInsuficienteException("Stock insuficiente para crear el pedido");
        }
    }

    public void aplicarCompra(Producto producto, Pedido pedido) {
        validarStock(producto, pedido.getCantidad());
        producto.decrementarStock(pedido.getCantidad());
        pedido.setPrecioUnitario(producto.getPrecio());
        pedido.setTotal(pedido.calcularTotal());
        pedido.setEstado(EstadoPedido.PENDIENTE);
    }

    public void validarTransicionEstado(Pedido pedido) {
        if (pedido == null || pedido.getEstado() == null) {
            throw new EstadoPedidoInvalidoException("El pedido no tiene un estado válido");
        }
    }

    public void validarCancelacion(Pedido pedido) {
        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new EstadoPedidoInvalidoException("Solo se puede cancelar un pedido pendiente");
        }
    }

    public void validarPermisoEdicion(Usuario solicitante, Producto producto) {
        boolean esAdmin = solicitante != null && solicitante.getRol() == com.agromarket.domain.models.enums.RolUsuario.ADMINISTRADOR;
        boolean esDueno = producto != null && producto.getProductor() != null && solicitante != null && producto.getProductor().getId() != null && producto.getProductor().getId().equals(solicitante.getId());
        if (!esAdmin && !esDueno) {
            throw new AccesoDenegadoException("No tiene permisos para operar sobre este producto");
        }
    }
}
