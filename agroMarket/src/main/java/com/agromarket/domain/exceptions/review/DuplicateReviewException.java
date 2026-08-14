package com.agromarket.domain.exceptions.review;

/**
 * Excepción lanzada cuando un usuario intenta crear una reseña para un producto
 * sobre el cual ya ha dejado una reseña anteriormente.
 * 
 * @author AgroMarket Team
 */
public class DuplicateReviewException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Ya ha dejado una reseña para este producto")
     */
    public DuplicateReviewException(String message) {
        super(message);
    }
}
