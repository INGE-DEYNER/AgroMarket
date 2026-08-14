
package com.agromarket.domain.ports.in.shipping;

import java.util.List;

import com.agromarket.domain.models.shipping.Shipping;

/**
 * Puerto de entrada para la gestión de envíos.
 */
public interface ShippingPort {

    /**
     * Crea un envío asociado a un pedido.
     */
    Shipping createShipping(Long orderId);

    /**
     * Obtiene un envío por ID.
     */
    Shipping getById(Long id);

    /**
     * Obtiene el envío asociado a un pedido.
     */
    Shipping getByOrderId(Long orderId);

    /**
     * Avanza el estado del envío.
     */
    Shipping advanceState(Long shippingId);

    /**
     * Cancela un envío cuando su estado lo permite.
     */
    Shipping cancel(Long shippingId);

    /**
     * Lista envíos.
     */
    List<Shipping> getAll();
}