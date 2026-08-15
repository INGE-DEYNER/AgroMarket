// com/agromarket/domain/ports/in/order/OrderPort.java
package com.agromarket.domain.ports.in.order;

import java.util.List;

import com.agromarket.application.dto.request.order.CreateOrderRequest;
import com.agromarket.application.dto.request.order.UpdateOrderRequest;
import com.agromarket.application.dto.response.order.OrderResponse;

/**
 * Puerto de entrada para servicios relacionados con pedidos.
 * Define las operaciones de negocio que pueden realizarse sobre pedidos.
 *
 * @author AgroMarket Team
 */
public interface OrderPort {

    /**
     * Crea un nuevo pedido.
     *
     * @param request datos del pedido a crear
     * @return respuesta con el pedido creado
     */
    OrderResponse createOrder(CreateOrderRequest request);

    /**
     * Actualiza un pedido existente.
     *
     * @param id identificador del pedido
     * @param request datos actualizados del pedido
     * @return respuesta con el pedido actualizado
     */
    OrderResponse updateOrder(
            Long id,
            UpdateOrderRequest request);

    /**
     * Obtiene un pedido por su identificador.
     *
     * @param id identificador del pedido
     * @return respuesta con los datos del pedido
     */
    OrderResponse getOrderById(Long id);

    /**
     * Obtiene todos los pedidos.
     *
     * @return lista de pedidos
     */
    List<OrderResponse> getAllOrders();

    /**
     * Obtiene los pedidos realizados por un comprador.
     *
     * @param buyerId identificador del comprador
     * @return lista de pedidos del comprador
     */
    List<OrderResponse> getOrdersByBuyer(Long buyerId);

    /**
     * Obtiene los pedidos relacionados con un productor.
     *
     * @param producerId identificador del productor
     * @return lista de pedidos del productor
     */
    List<OrderResponse> getOrdersByProducer(Long producerId);

    /**
     * Avanza el estado de un pedido.
     *
     * @param orderId identificador del pedido
     */
    void advanceOrderState(Long orderId);

    /**
     * Cancela un pedido.
     *
     * @param orderId identificador del pedido
     */
    void cancelOrder(Long orderId);

    /**
     * Elimina un pedido.
     *
     * @param id identificador del pedido
     */
    void deleteOrder(Long id);
}