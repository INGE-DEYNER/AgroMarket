package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.agromarket.domain.order.enums.OrderState;
import com.agromarket.infrastructure.persistence.sql.entities.OrderEntity;

/**
 * Repositorio JPA para la gestión de pedidos.
 * Proporciona métodos para consultar y manipular pedidos en la base de datos.
 * 
 * @author AgroMarket Team
 */
public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {
    
    /**
     * Obtiene todos los pedidos con el comprador, producto y productor cargados (eager load).
     */
    @Override
    @EntityGraph(attributePaths = {"buyer", "product", "product.producer"})
    List<OrderEntity> findAll();

    /**
     * Obtiene pedidos por comprador con el producto y productor cargados.
     * 
     * @param buyerId el ID del comprador
     * @return lista de pedidos del comprador
     */
    @EntityGraph(attributePaths = {"buyer", "product", "product.producer"})
    List<OrderEntity> findByBuyerId(Long buyerId);

    /**
     * Obtiene pedidos por productor (a través del producto) con el comprador cargado.
     * 
     * @param producerId el ID del productor
     * @return lista de pedidos del productor
     */
    @EntityGraph(attributePaths = {"buyer", "product", "product.producer"})
    List<OrderEntity> findByProductProducerId(Long producerId);

    /**
     * Obtiene pedidos por estado.
     * 
     * @param state el estado del pedido
     * @return lista de pedidos con el estado especificado
     */
    List<OrderEntity> findByState(OrderState state);

    /**
     * Obtiene pedidos por ID de checkout.
     * 
     * @param checkoutId el ID de la sesión de checkout
     * @return lista de pedidos con el checkout ID especificado
     */
    @EntityGraph(attributePaths = {"buyer", "product", "product.producer"})
    List<OrderEntity> findByCheckoutId(String checkoutId);
}
