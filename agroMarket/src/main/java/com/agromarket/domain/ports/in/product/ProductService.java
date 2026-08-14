package com.agromarket.domain.product.ports.in;

import java.util.List;

import com.agromarket.domain.product.model.Product;
import com.agromarket.domain.product.model.Review;

/**
 * Puerto de entrada para servicios relacionados con productos.
 * Define las operaciones de negocio que pueden realizarse sobre productos en el catálogo.
 * 
 * @author AgroMarket Team
 */
public interface ProductService {
    
    /**
     * Crea un nuevo producto en el catálogo.
     * 
     * @param product el producto a crear
     * @return el producto creado con su ID asignado
     */
    Product createProduct(Product product);
    
    /**
     * Actualiza un producto existente.
     * 
     * @param product el producto con los datos actualizados
     * @return el producto actualizado
     */
    Product updateProduct(Product product);
    
    /**
     * Obtiene un producto por su identificador.
     * 
     * @param id el identificador del producto
     * @return el producto encontrado
     * @throws com.agromarket.domain.product.exceptions.ProductNotFoundException si el producto no existe
     */
    Product getProductById(Long id);
    
    /**
     * Obtiene todos los productos activos del catálogo.
     * 
     * @return lista de todos los productos activos
     */
    List<Product> getAllActiveProducts();
    
    /**
     * Obtiene productos por tipo de fruta.
     * 
     * @param fruitType el tipo de fruta a filtrar
     * @return lista de productos del tipo de fruta especificado
     */
    List<Product> getProductsByFruitType(com.agromarket.domain.product.enums.FruitType fruitType);
    
    /**
     * Obtiene productos por productor.
     * 
     * @param producerId el identificador del productor
     * @return lista de productos del productor
     */
    List<Product> getProductsByProducer(Long producerId);
    
    /**
     * Elimina un producto del catálogo (desactivación lógica).
     * 
     * @param id el identificador del producto a eliminar
     */
    void deleteProduct(Long id);
    
    /**
     * Busca productos por nombre o descripción.
     * 
     * @param query el término de búsqueda
     * @return lista de productos que coinciden con el término de búsqueda
     */
    List<Product> searchProducts(String query);
    
    /**
     * Obtiene productos en promoción.
     * 
     * @return lista de productos que actualmente están en promoción
     */
    List<Product> getProductsOnPromotion();
    
    /**
     * Agrega una reseña a un producto.
     * 
     * @param review la reseña a agregar
     * @return la reseña creada
     * @throws DuplicateReviewException si el usuario ya ha dejado una reseña para este producto
     */
    Review addReview(Review review);
    
    /**
     * Obtiene todas las reseñas de un producto.
     * 
     * @param productId el identificador del producto
     * @return lista de reseñas del producto
     */
    List<Review> getReviewsByProduct(Long productId);
    
    /**
     * Actualiza el stock de un producto.
     * 
     * @param productId el identificador del producto
     * @param newQuantity la nueva cantidad disponible
     * @return el producto actualizado
     */
    Product updateProductStock(Long productId, int newQuantity);
}
