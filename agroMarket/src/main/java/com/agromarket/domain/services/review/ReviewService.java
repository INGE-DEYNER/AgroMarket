package com.agromarket.domain.services.review;

import com.agromarket.domain.exceptions.review.DuplicateReviewException;
import com.agromarket.domain.models.review.Review;

/**
 * Servicio de dominio para reglas de reseñas.
 */
public class ReviewService {

    private static final int MIN_RATING = 1;
    private static final int MAX_RATING = 5;

    /**
     * Valida una reseña.
     */
    public void validate(Review review) {

        if (review == null) {
            throw new IllegalArgumentException(
                    "La reseña es obligatoria"
            );
        }

        if (review.getBuyer() == null) {
            throw new IllegalArgumentException(
                    "El comprador es obligatorio"
            );
        }

        if (review.getProduct() == null) {
            throw new IllegalArgumentException(
                    "El producto es obligatorio"
            );
        }

        if (review.getRating() == null
                || review.getRating() < MIN_RATING
                || review.getRating() > MAX_RATING) {

            throw new IllegalArgumentException(
                    "La calificación debe estar entre 1 y 5"
            );
        }

        if (review.getComment() != null
                && review.getComment().length() > 1000) {

            throw new IllegalArgumentException(
                    "El comentario no puede superar los 1000 caracteres"
            );
        }
    }

    /**
     * Evita que un comprador reseñe dos veces el mismo producto.
     */
    public void validateUniqueReview(boolean alreadyExists) {

        if (alreadyExists) {
            throw new DuplicateReviewException(
                    "El comprador ya realizó una reseña para este producto"
            );
        }
    }
}