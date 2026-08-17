
package com.agromarket.domain.ports.in.review;

import java.util.List;

import com.agromarket.domain.models.review.Review;

/**
 * Puerto de entrada para las operaciones de reseñas.
 */
public interface ReviewPort {

    /**
     * Crea una reseña asociada a un producto y un comprador.
     */
    Review create(
            Long productId,
            Long reviewerId,
            Integer rating,
            String comment);

    /**
     * Obtiene una reseña por ID.
     */
    Review getById(Long id);

    /**
     * Obtiene las reseñas de un producto.
     */
    List<Review> getByProductId(Long productId);

    /**
     * Obtiene las reseñas realizadas por un usuario.
     */
    List<Review> getByReviewerId(Long reviewerId);

    /**
     * Elimina una reseña.
     */
    void delete(Long id);

}