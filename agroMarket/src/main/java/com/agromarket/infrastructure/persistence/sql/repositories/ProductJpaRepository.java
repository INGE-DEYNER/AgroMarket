package com.agromarket.infrastructure.persistence.sql.repositories;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.agromarket.domain.product.enums.FruitType;
import com.agromarket.infrastructure.persistence.sql.entities.ProductEntity;

/**
 * Repositorio JPA para la gestión de productos.
 * Proporciona métodos para consultar y manipular productos en la base de datos.
 * 
 * @author AgroMarket Team
 */
public interface ProductJpaRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

    /**
     * Obtiene todos los productos con el productor cargado (eager load).
     */
    @Override
    @EntityGraph(attributePaths = {"producer"})
    Page<ProductEntity> findAll(Specification<ProductEntity> spec, Pageable pageable);

    /**
     * Busca productos por nombre.
     * 
     * @param keyword el término de búsqueda
     * @return lista de productos que coinciden
     */
    List<ProductEntity> findByNameContainingIgnoreCase(String keyword);

    /**
     * Busca productos por nombre o descripción.
     * 
     * @param name el término de búsqueda en el nombre
     * @param description el término de búsqueda en la descripción
     * @return lista de productos que coinciden
     */
    List<ProductEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    /**
     * Busca productos por tipo de fruta.
     * 
     * @param fruitType el tipo de fruta
     * @return lista de productos del tipo de fruta especificado
     */
    List<ProductEntity> findByFruitType(FruitType fruitType);

    /**
     * Busca productos por rango de precio.
     * 
     * @param min precio mínimo
     * @param max precio máximo
     * @return lista de productos en el rango de precio
     */
    List<ProductEntity> findByPriceBetween(BigDecimal min, BigDecimal max);

    /**
     * Busca productos por cantidad disponible.
     * 
     * @param quantity la cantidad mínima disponible
     * @return lista de productos con la cantidad disponible especificada
     */
    List<ProductEntity> findByAvailableQuantityGreaterThan(Integer quantity);

    /**
     * Busca productos por productor.
     * 
     * @param producerId el ID del productor
     * @return lista de productos del productor
     */
    List<ProductEntity> findByProducerId(Long producerId);

    /**
     * Busca productos por productor con paginación.
     * 
     * @param producerId el ID del productor
     * @param pageable información de paginación
     * @return página de productos del productor
     */
    Page<ProductEntity> findByProducerId(Long producerId, Pageable pageable);

    /**
     * Obtiene los productos menos vendidos.
     * 
     * @param pageable información de paginación
     * @return lista de productos menos vendidos
     */
    @Query("SELECT p FROM ProductEntity p WHERE p.active=true ORDER BY p.totalSold ASC")
    List<ProductEntity> findLeastSold(Pageable pageable);

    /**
     * Cuenta el número de productos activos.
     * 
     * @return el número de productos activos
     */
    @Query("SELECT COUNT(p) FROM ProductEntity p WHERE p.active=true")
    long countActive();

    /**
     * Verifica si existe un producto con el nombre y productor especificados.
     * 
     * @param name el nombre del producto
     * @param producerId el ID del productor
     * @return true si existe, false de lo contrario
     */
    boolean existsByNameIgnoreCaseAndProducerId(String name, Long producerId);

    /**
     * Busca un producto por productor y tipo de fruta.
     * 
     * @param producerId el ID del productor
     * @param fruitType el tipo de fruta
     * @return Optional conteniendo el producto si existe
     */
    java.util.Optional<ProductEntity> findByProducerIdAndFruitType(Long producerId, FruitType fruitType);

    /**
     * Busca productos en promoción que han finalizado.
     * 
     * @param date la fecha de finalización
     * @return lista de productos en promoción que han finalizado
     */
    List<ProductEntity> findByOnPromotionTrueAndPromotionEndDateBefore(java.time.LocalDateTime date);

    /**
     * Obtiene el precio promedio de todos los productos.
     * 
     * @return el precio promedio
     */
    @Query("SELECT AVG(p.price) FROM ProductEntity p")
    Double getAveragePrice();
    
    /**
     * Busca productos activos.
     * 
     * @return lista de productos activos
     */
    List<ProductEntity> findByActiveTrue();
    
    /**
     * Busca productos en promoción.
     * 
     * @return lista de productos en promoción
     */
    List<ProductEntity> findByOnPromotionTrue();
}
