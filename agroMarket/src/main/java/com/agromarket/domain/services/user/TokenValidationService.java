package com.agromarket.domain.services.user;


 import java.time.LocalDateTime;

import com.agromarket.domain.models.user.User;
 
 /**
  * Servicio de dominio para validar tokens asociados al usuario.
  */
 public class TokenValidationService {
 
     /**
      * Verifica si un token de confirmación de correo sigue siendo válido.
      *

     * <p>El token y su fecha de expiración se encuentran embebidos
     * directamente en User.</p>
     *
     * @param user usuario propietario del token
     * @param token token recibido
      * @return true si puede utilizarse
      */
     public boolean isEmailVerificationTokenValid(
            User user,
            String token) {
 

        if (user == null
                || token == null
                || token.isBlank()) {
             return false;
         }
 

        if (user.getEmailVerificationToken() == null
                || !user.getEmailVerificationToken().equals(token)) {
            return false;
        }

        return user.getEmailTokenExpiry() != null
                && user.getEmailTokenExpiry().isAfter(LocalDateTime.now());
     }
 
     /**
      * Verifica si un token de recuperación de contraseña es válido.
      *

     * <p>El token y su fecha de expiración se encuentran embebidos
     * directamente en User.</p>
     *
     * @param user usuario propietario del token
     * @param token token recibido
      * @return true si puede utilizarse
      */
     public boolean isPasswordResetTokenValid(

            User user,
            String token) {
 

        if (user == null
                || token == null
                || token.isBlank()) {
             return false;
         }
 

        if (user.getPasswordResetToken() == null
                || !user.getPasswordResetToken().equals(token)) {
            return false;
        }

        return user.getPasswordResetTokenExpiry() != null
                && user.getPasswordResetTokenExpiry()
                        .isAfter(LocalDateTime.now());
     }
 }