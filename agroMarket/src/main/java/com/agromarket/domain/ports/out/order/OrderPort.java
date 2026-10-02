package com.agromarket.domain.ports.out.order;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.order.Order;

/**
 * Puerto de salida para el repositorio de pedidos.
 * Define las operaciones de persistencia para pedidos.
 * 
 * @author AgroMarket Team
 */
public interface OrderPort {

    /**
     * Guarda un pedido en el repositorio.
     * 
     * @param order el pedido a guardar
     * @return el pedido guardado con su ID asignado
     */
    Order save(Order order);

    /**
     * Busca un pedido por su identificador.
     * 
     * @param id el identificador del pedido
     * @return Optional conteniendo el pedido si existe, vacío de lo contrario
     */
    Optional<Order> findById(Long id);

    /**
     * Obtiene todos los pedidos.
     * 
     * @return lista de todos los pedidos
     */
    List<Order> findAll();

    /**
     * Obtiene pedidos por comprador.
     * 
     * @param buyerId el identificador del comprador
     * @return lista de pedidos del comprador
     */
    List<Order> findByBuyerId(Long buyerId);

    /**
     * Obtiene pedidos por productor.
     * 
     * @param producerId el identificador del productor
     * @return lista de pedidos del productor
     */
    List<Order> findByProducerId(Long producerId);

    /**
     * Obtiene pedidos por estado.
     * 
     * @param state el estado del pedido
     * @return lista de pedidos con el estado especificado
     */
    List<Order> findByState(OrderState state);

    /**
     * Elimina un pedido del repositorio por su identificador.
     * 
     * @param id el identificador del pedido a eliminar
     */
    void deleteById(Long id);

    /**
     * Verifica si existe un pedido con el ID especificado.
     * 
     * @param id el identificador del pedido
     * @return true si existe, false de lo contrario
     */
    boolean existsById(Long id);

    /**
     * Verifica si ya existe al menos un pedido asociado a una sesión de
     * checkout. El backend la usa para cobrar el envío una única vez por
     * compra: el primer pedido del checkout lo lleva y los siguientes no.
     * 
     * @param checkoutId el identificador de la sesión de checkout
     * @return true si ya existe un pedido con ese checkoutId
     */
    boolean existsByCheckoutId(String checkoutId);
}
