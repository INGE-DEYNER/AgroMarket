package com.agromarket.domain.services.product;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.product.Product;

/**
 * Servicio de dominio para las reglas principales de productos.
 */
public class ProductService {

    /**
     * Determina si un producto está disponible para venta.
     *
     * @param product producto
     * @return true si puede venderse
     */
    public boolean isAvailable(Product product) {
        return product != null
                && product.isActive()
                && product.getAvailableQuantity() != null
                && product.getAvailableQuantity() > 0;
    }

    /**
     * Verifica si existe stock suficiente.
     *
     * @param product producto
     * @param quantity cantidad requerida
     * @return true si hay stock suficiente
     */
    public boolean hasEnoughStock(Product product, int quantity) {

        if (quantity <= 0) {
            return false;
        }

        return product != null
                && product.getAvailableQuantity() != null
                && product.getAvailableQuantity() >= quantity;
    }

    /**
     * Obtiene el precio efectivo del producto.
     *
     * @param product producto
     * @return precio aplicable
     */
    public BigDecimal getEffectivePrice(Product product) {

        if (product == null || product.getPrice() == null) {
            throw new IllegalArgumentException(
                    "El producto y su precio son obligatorios"
            );
        }

        if (isPromotionActive(product)) {
            return product.getPromotionPrice();
        }

        return product.getPrice();
    }

    /**
     * Verifica si una promoción sigue vigente.
     *
     * @param product producto
     * @return true si la promoción está activa
     */
    public boolean isPromotionActive(Product product) {

        if (product == null
                || !product.isOnPromotion()
                || product.getPromotionPrice() == null) {
            return false;
        }

        return product.getPromotionEndDate() == null
                || product.getPromotionEndDate()
                        .isAfter(LocalDateTime.now());
    }
}