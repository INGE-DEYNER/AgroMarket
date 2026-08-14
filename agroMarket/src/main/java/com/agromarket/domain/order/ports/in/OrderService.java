package com.agromarket.domain.order.ports.in;

import java.util.List;

import com.agromarket.domain.order.model.Order;

/**
 * Puerto de entrada para servicios relacionados con pedidos.
 * Define las operaciones de negocio que pueden realizarse sobre pedidos.
 * 
 * @author AgroMarket Team
 */
public interface OrderService {
    
    /**
     * Crea un nuevo pedido.
     * 
     * @param order el pedido a crear
     * @return el pedido creado con su ID asignado
     */
    Order createOrder(Order order);
    
    /**
     * Actualiza un pedido existente.
     * 
     * @param order el pedido con los datos actualizados
     * @return el pedido actualizado
     */
    Order updateOrder(Order order);
    
    /**
     * Obtiene un pedido por su identificador.
     * 
     * @param id el identificador del pedido
     * @return el pedido encontrado
     * @throws com.agromarket.domain.order.exceptions.OrderNotFoundException si el pedido no existe
     */
    Order getOrderById(Long id);
    
    /**
     * Obtiene todos los pedidos.
     * 
     * @return lista de todos los pedidos
     */
    List<Order> getAllOrders();
    
    /**
     * Obtiene pedidos por comprador.
     * 
     * @param buyerId el identificador del comprador
     * @return lista de pedidos del comprador
     */
    List<Order> getOrdersByBuyer(Long buyerId);
    
    /**
     * Obtiene pedidos por productor.
     * 
     * @param producerId el identificador del productor
     * @return lista de pedidos del productor
     */
    List<Order> getOrdersByProducer(Long producerId);
    
    /**
     * Avanza el estado de un pedido.
     * 
     * @param orderId el identificador del pedido
     */
    void advanceOrderState(Long orderId);
    
    /**
     * Cancela un pedido.
     * 
     * @param orderId el identificador del pedido
     */
    void cancelOrder(Long orderId);
    
    /**
     * Elimina un pedido.
     * 
     * @param id el identificador del pedido
     */
    void deleteOrder(Long id);
}
