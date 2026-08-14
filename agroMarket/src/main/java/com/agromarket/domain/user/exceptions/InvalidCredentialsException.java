package com.agromarket.domain.user.exceptions;

/**
 * Excepción lanzada cuando las credenciales de autenticación (correo y/o contraseña)
 * proporcionadas por el usuario son inválidas.
 * 
 * @author AgroMarket Team
 */
public class InvalidCredentialsException extends RuntimeException {
    
    /**
     * Constructor con mensaje descriptivo.
     * 
     * @param message mensaje que describe el error (ej: "Correo o contraseña incorrectos")
     */
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
