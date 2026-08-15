package com.agromarket.domain.models.review;

import java.time.LocalDateTime;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.models.product.Product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa una reseña o calificación de un producto.
 * Las reseñas son creadas por compradores y asociadas a un producto específico.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    
    private Long id;
    
    /**
     * Usuario que creó la reseña (debe ser un comprador).
     */
    private User buyer;
    
    /**
     * Producto al cual pertenece la reseña.
     */
    private Product product;
    
    /**
     * Calificación numérica de la reseña (ej: 1-5 estrellas).
     */
    private Integer rating;
    
    /**
     * Comentario o descripción escrita de la reseña.
     */
    private String comment;
    
    /**
     * Fecha y hora en que se creó la reseña.
     */
    private LocalDateTime date;
}
