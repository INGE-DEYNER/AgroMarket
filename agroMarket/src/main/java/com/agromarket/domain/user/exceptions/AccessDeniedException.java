package com.agromarket.domain.user.exceptions;

/**
 * Excepción lanzada cuando un usuario intenta acceder a un recurso o realizar
 * una acción para la cual no tiene permisos suficientes.
 * 
 * @author AgroMarket Team
 */
public class AccessDeniedException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "No tiene permiso para realizar esta acción")
     */
    public AccessDeniedException(String message) {
        super(message);
    }
}
