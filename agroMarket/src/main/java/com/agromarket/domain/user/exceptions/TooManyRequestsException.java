package com.agromarket.domain.user.exceptions;

/**
 * Excepción lanzada cuando un usuario excede el límite de peticiones permitidas
 * en un período de tiempo determinado (rate limiting).
 * 
 * @author AgroMarket Team
 */
public class TooManyRequestsException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Demasiadas peticiones. Intente de nuevo en X segundos")
     */
    public TooManyRequestsException(String message) {
        super(message);
    }
}
