package com.agromarket.domain.exceptions.order;
import com.agromarket.domain.exceptions.DomainException;
/**
 * Excepción lanzada cuando se intenta acceder a un pedido que no existe.
 * 
 * @author AgroMarket Team
 */
public class OrderNotFoundException extends DomainException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error
     */
    public OrderNotFoundException(String message) {
        super(message);
    }
    
    /**
     * Constructor con mensaje y causa.
     * 
     * @param message mensaje que describe el error
     * @param cause la causa de la excepción
     */
    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
