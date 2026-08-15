// com/agromarket/domain/ports/in/product/ProductPort.java
package com.agromarket.domain.ports.in.product;

import java.util.List;

import com.agromarket.application.dto.request.product.CreateProductRequest;
import com.agromarket.application.dto.request.product.CreateReviewRequest;
import com.agromarket.application.dto.request.product.UpdateProductRequest;
import com.agromarket.application.dto.request.product.UpdateProductStockRequest;
import com.agromarket.application.dto.response.product.ProductResponse;
import com.agromarket.application.dto.response.review.ReviewResponse;

/**
 * Puerto de entrada para servicios relacionados con productos.
 * Define las operaciones de negocio que pueden realizarse sobre productos
 * en el catálogo.
 *
 * @author AgroMarket Team
 */
public interface ProductPort {

    /**
     * Crea un nuevo producto en el catálogo.
     *
     * @param request datos del producto a crear
     * @return respuesta con el producto creado
     */
    ProductResponse createProduct(CreateProductRequest request);

    /**
     * Actualiza un producto existente.
     *
     * @param id identificador del producto
     * @param request datos actualizados del producto
     * @return respuesta con el producto actualizado
     */
    ProductResponse updateProduct(
            Long id,
            UpdateProductRequest request);

    /**
     * Obtiene un producto por su identificador.
     *
     * @param id identificador del producto
     * @return respuesta con los datos del producto
     */
    ProductResponse getProductById(Long id);

    /**
     * Obtiene todos los productos activos del catálogo.
     *
     * @return lista de productos activos
     */
    List<ProductResponse> getAllActiveProducts();

    /**
     * Obtiene productos por tipo de fruta.
     *
     * @param fruitType tipo de fruta a filtrar
     * @return lista de productos del tipo especificado
     */
    List<ProductResponse> getProductsByFruitType(String fruitType);

    /**
     * Obtiene productos por productor.
     *
     * @param producerId identificador del productor
     * @return lista de productos del productor
     */
    List<ProductResponse> getProductsByProducer(Long producerId);

    /**
     * Elimina un producto del catálogo mediante desactivación lógica.
     *
     * @param id identificador del producto
     */
    void deleteProduct(Long id);

    /**
     * Busca productos por nombre o descripción.
     *
     * @param query término de búsqueda
     * @return lista de productos que coinciden con la búsqueda
     */
    List<ProductResponse> searchProducts(String query);

    /**
     * Obtiene los productos que actualmente están en promoción.
     *
     * @return lista de productos en promoción
     */
    List<ProductResponse> getProductsOnPromotion();

    /**
     * Agrega una reseña a un producto.
     *
     * @param productId identificador del producto
     * @param request datos de la reseña
     * @return respuesta con la reseña creada
     */
    ReviewResponse addReview(
            Long productId,
            CreateReviewRequest request);

    /**
     * Obtiene todas las reseñas de un producto.
     *
     * @param productId identificador del producto
     * @return lista de reseñas del producto
     */
    List<ReviewResponse> getReviewsByProduct(Long productId);

    /**
     * Actualiza el stock disponible de un producto.
     *
     * @param productId identificador del producto
     * @param request datos de actualización del stock
     * @return respuesta con el producto actualizado
     */
    ProductResponse updateProductStock(
            Long productId,
            UpdateProductStockRequest request);
}