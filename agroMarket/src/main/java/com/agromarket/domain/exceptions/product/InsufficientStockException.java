package com.agromarket.domain.product.exceptions;

/**
 * Excepción lanzada cuando se intenta realizar una operación (como comprar o reservar)
 * sobre un producto que no tiene suficiente stock disponible.
 * 
 * @author AgroMarket Team
 */
public class InsufficientStockException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Stock insuficiente para el producto X")
     */
    public InsufficientStockException(String message) {
        super(message);
    }
}
