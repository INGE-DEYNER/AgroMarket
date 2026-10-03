package com.agromarket.domain.models.product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.exceptions.product.InsufficientStockException;
import com.agromarket.domain.models.enums.product.FruitType;
import com.agromarket.domain.models.review.Review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un producto en el catálogo de AgroMarket.
 * Contiene información como precio, stock, descripción y el productor asociado.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    private Long id;

    /**
     * Nombre del producto.
     */
    private String name;

    /**
     * Descripción detallada del producto.
     */
    private String description;

    /**
     * Precio unitario del producto.
     */
    private BigDecimal price;

    /**
     * Cantidad disponible en inventario.
     */
    private Integer availableQuantity;

    /**
     * URL de la imagen principal del producto.
     */
    private String imageUrl;

    /**
     * Cantidad mínima requerida para comprar al por mayor.
     */
    private Integer minimumWholesaleQuantity;

    /**
     * Precio especial para compras al por mayor.
     */
    private BigDecimal wholesalePrice;

    /**
     * Tipo de fruta del producto.
     */
    private FruitType fruitType;

    /**
     * Usuario que publicó el producto (debe ser un productor).
     */
    private User producer;

    /**
     * Indica si el producto está en promoción.
     */
    private boolean onPromotion;

    /**
     * Precio promocional del producto.
     */
    private BigDecimal promotionPrice;

    /**
     * Fecha y hora en que finaliza la promoción.
     */
    private LocalDateTime promotionEndDate;

    /**
     * Cantidad total de unidades vendidas de este producto.
     */
    @Builder.Default
    private Integer totalSold = 0;

    /**
     * Indica si el producto está activo y visible en el catálogo.
     */
    @Builder.Default
    private boolean active = true;

    /**
     * Fecha y hora en que se creó el producto.
     */
    private LocalDateTime createdAt;

    /**
     * Lista de reseñas asociadas a este producto.
     */
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    /**
     * Versión del producto para control de concurrency.
     */
    private Long version;

    // ==================== MÉTODOS DE NEGOCIO ====================

    /**
     * Verifica si el producto está disponible para su compra.
     * Un producto está disponible si está activo y tiene stock.
     * 
     * @return true si el producto está disponible, false de lo contrario
     */
    public boolean isAvailable() {
        return active && availableQuantity != null && availableQuantity > 0;
    }

    /**
     * Decrementa el stock del producto por la cantidad especificada.
     * 
     * @param quantity cantidad a restar del stock
     * @throws InsufficientStockException si no hay suficiente stock
     */
    public void decrementStock(int quantity) {
        if (availableQuantity == null || availableQuantity < quantity) {
            throw new InsufficientStockException("No hay stock suficiente para la operación");
        }
        availableQuantity -= quantity;
    }

    /**
     * Calcula la calificación promedio del producto basado en sus reseñas.
     * 
     * @param reviews lista de reseñas del producto
     * @return calificación promedio (0.0 si no hay reseñas)
     */
    public double calculateAverageRating(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return 0.0;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (Review review : reviews) {
            if (review.getRating() != null) {
                total = total.add(BigDecimal.valueOf(review.getRating()));
            }
        }
        return total.divide(BigDecimal.valueOf(reviews.size()), 2, RoundingMode.HALF_UP).doubleValue();
    }

    /**
     * Calcula la calificación promedio usando las reseñas del producto.
     * 
     * @return calificación promedio
     */
    public double getAverageRating() {
        return calculateAverageRating(this.reviews);
    }

    public void endPromotion() {
        this.onPromotion = false;
        this.promotionPrice = null;
        this.promotionEndDate = null;
    }
}
