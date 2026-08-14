package com.agromarket.domain.exceptions;

/**
 * Excepción genérica lanzada cuando un recurso solicitado (usuario, producto, pedido, etc.)
 * no es encontrado en el sistema.
 * 
 * @author AgroMarket Team
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Producto no encontrado con ID: X")
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
