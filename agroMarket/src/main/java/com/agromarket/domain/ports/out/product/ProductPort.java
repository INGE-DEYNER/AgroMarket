package com.agromarket.domain.ports.out.product;


import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.enums.product.FruitType;;

/**
 * Puerto de salida para el repositorio de productos.
 * Define las operaciones de persistencia para productos y reseñas.
 * La implementación concreta será proporcionada por el adaptador JPA.
 * 
 * @author AgroMarket Team
 */
public interface ProductPort {
    
    /**
     * Guarda un producto en el repositorio.
     * 
     * @param product el producto a guardar
     * @return el producto guardado con su ID asignado
     */
    Product save(Product product);
    
    /**
     * Busca un producto por su identificador.
     * 
     * @param id el identificador del producto
     * @return Optional conteniendo el producto si existe, vacío de lo contrario
     */
    Optional<Product> findById(Long id);
    
    /**
     * Obtiene todos los productos.
     * 
     * @return lista de todos los productos
     */
    List<Product> findAll();
    
    /**
     * Obtiene todos los productos activos.
     * 
     * @return lista de productos activos
     */
    List<Product> findAllByActiveTrue();
    
    /**
     * Obtiene productos por tipo de fruta.
     * 
     * @param fruitType el tipo de fruta a filtrar
     * @return lista de productos del tipo de fruta especificado
     */
    List<Product> findByFruitType(FruitType fruitType);
    
    /**
     * Obtiene productos por productor.
     * 
     * @param producerId el identificador del productor
     * @return lista de productos del productor
     */
    List<Product> findByProducerId(Long producerId);
    
    /**
     * Busca productos por nombre o descripción.
     * 
     * @param query el término de búsqueda
     * @return lista de productos que coinciden con el término de búsqueda
     */
    List<Product> searchByNameOrDescription(String query);
    
    /**
     * Obtiene productos en promoción.
     * 
     * @return lista de productos en promoción
     */
    List<Product> findByOnPromotionTrue();
    
    /**
     * Busca un producto por nombre y productor.
     * 
     * @param name el nombre del producto
     * @param producerId el identificador del productor
     * @return Optional conteniendo el producto si existe, vacío de lo contrario
     */
    Optional<Product> findByNameAndProducerId(String name, Long producerId);

    /**
     * Elimina un producto del repositorio.
     * 
     * @param product el producto a eliminar
     */
    void delete(Product product);
    }
