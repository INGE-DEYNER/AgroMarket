
package com.agromarket.domain.ports.out.review;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.review.Review;

/**
 * Puerto de salida para persistencia de reseñas.
 */
public interface ReviewPort{

    /**
     * Guarda una reseña.
     */
    Review save(Review review);

    /**
     * Busca una reseña por ID.
     */
    Optional<Review> findById(Long id);

    /**
     * Busca las reseñas de un producto.
     */
    List<Review> findByProductId(Long productId);

    /**
     * Busca las reseñas de un usuario.
     */
    List<Review> findByReviewerId(Long reviewerId);
    /**
     * Lista todas las reseñas, de la más reciente a la más antigua.
     * Lo usa el panel de administración para moderar contenido.
     */
    List<Review> findAll();



    /**
     * Verifica si el usuario ya reseñó un producto.
     */
    boolean existsByProductIdAndReviewerId(
            Long productId,
            Long reviewerId
    );

    /**
     * Elimina una reseña.
     */
    void delete(Review review);
}