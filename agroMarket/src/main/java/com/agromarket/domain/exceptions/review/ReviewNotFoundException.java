package com.agromarket.domain.exceptions.review;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando no se encuentra una reseña.
 */
public class ReviewNotFoundException extends DomainException {

    public ReviewNotFoundException(String message) {
        super(message);
    }
}