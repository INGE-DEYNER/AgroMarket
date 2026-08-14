package com.agromarket.infrastructure.persistence.sql.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.agromarket.domain.order.enums.OrderState;
import com.agromarket.infrastructure.persistence.sql.entities.ReviewEntity;

/**
 * Repositorio JPA para la gestión de reseñas de productos.
 * Proporciona métodos para consultar y manipular reseñas en la base de datos.
 * 
 * @author AgroMarket Team
 */
public interface ReviewJpaRepository extends JpaRepository<ReviewEntity, Long> {
    
    /**
     * Obtiene todas las reseñas con el comprador cargado (eager load).
     */
    @Override
    @EntityGraph(attributePaths = {"buyer"})
    List<ReviewEntity> findAll(org.springframework.data.domain.Sort sort);

    /**
     * Obtiene todas las reseñas de un producto específico.
     * 
     * @param productId el ID del producto
     * @return lista de reseñas del producto
     */
    @EntityGraph(attributePaths = {"buyer"})
    List<ReviewEntity> findByProductId(Long productId);

    /**
     * Verifica si existe una reseña de un comprador para un producto.
     * 
     * @param buyerId el ID del comprador
     * @param productId el ID del producto
     * @return true si existe, false de lo contrario
     */
    boolean existsByBuyerIdAndProductId(Long buyerId, Long productId);
    
    /**
     * Verifica si existe una reseña por ID de producto y ID de comprador.
     * Método alternativo con nombres de parámetros explícitos para consultas.
     * 
     * @param productId el ID del producto
     * @param buyerId el ID del comprador
     * @return true si existe, false de lo contrario
     */
    boolean existsByProductIdAndBuyerId(Long productId, Long buyerId);

    /**
     * Verifica si un comprador ha recibido un producto (pedido entregado).
     * 
     * @param buyerId el ID del comprador
     * @param productId el ID del producto
     * @param status el estado del pedido
     * @return true si el producto ha sido entregado
     */
    @Query("""
            select case when count(o) > 0 then true else false end
            from OrderEntity o
            where o.buyer.id = :buyerId
              and o.product.id = :productId
              and o.state = :state
            """)
    boolean hasDeliveredProduct(@Param("buyerId") Long buyerId, @Param("productId") Long productId, @Param("state") OrderState state);

    /**
     * Verifica si un comprador ha recibido un producto (versión simplificada).
     * 
     * @param buyerId el ID del comprador
     * @param productId el ID del producto
     * @return true si el producto ha sido entregado
     */
    default boolean hasDeliveredProduct(Long buyerId, Long productId) {
        return hasDeliveredProduct(buyerId, productId, OrderState.DELIVERED);
    }

    /**
     * Obtiene la calificación promedio de todas las reseñas.
     * 
     * @return la calificación promedio
     */
    @Query("SELECT AVG(r.rating) FROM ReviewEntity r")
    Double getAverageRating();
}
