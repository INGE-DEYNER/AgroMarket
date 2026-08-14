package com.agromarket.domain.user.ports.in;

/**
 * Puerto de entrada que define las operaciones para la recuperación de contraseña.
 * Permite a los usuarios solicitar un restablecimiento de contraseña y completar el proceso.
 * 
 * @author AgroMarket Team
 */
public interface PasswordResetService {
    
    /**
     * Solicita un restablecimiento de contraseña.
     * Envía un correo con un enlace de restablecimiento.
     * 
     * @param email dirección de correo del usuario
     */
    void requestPasswordReset(String email);
    
    /**
     * Restablece la contraseña de un usuario usando un token.
     * 
     * @param token token de restablecimiento
     * @param newPassword nueva contraseña
     */
    void resetPassword(String token, String newPassword);
    
    /**
     * Cambia la contraseña de un usuario.
     * 
     * @param userId ID del usuario
     * @param currentPassword contraseña actual
     * @param newPassword nueva contraseña
     */
    void changePassword(Long userId, String currentPassword, String newPassword);
}

