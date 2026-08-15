package com.agromarket.domain.exceptions.product;
import com.agromarket.domain.exceptions.DomainException;


/**
 * Excepción lanzada cuando se intenta acceder a un producto que no existe en el catálogo.
 * 
 * @author AgroMarket Team
 */
public class ProductNotFoundException extends DomainException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Producto con ID X no encontrado")
     */
    public ProductNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Constructor con mensaje y causa.
     * 
     * @param message mensaje que describe el error
     * @param cause la causa de la excepción
     */
    public ProductNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
