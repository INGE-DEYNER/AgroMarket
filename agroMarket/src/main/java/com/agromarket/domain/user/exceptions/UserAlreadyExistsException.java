package com.agromarket.domain.user.exceptions;

/**
 * Excepción lanzada cuando se intenta registrar un usuario con un correo o nombre de usuario
 * que ya existe en el sistema.
 * 
 * @author AgroMarket Team
 */
public class UserAlreadyExistsException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "El correo ya está registrado")
     */
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
