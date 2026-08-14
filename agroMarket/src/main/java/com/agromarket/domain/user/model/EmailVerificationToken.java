package com.agromarket.domain.user.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un token de verificación de correo electrónico.
 * Se utiliza para confirmar que el usuario tiene acceso al correo registrado.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {
    
    private Long id;
    
    /**
     * ID del usuario asociado al token.
     */
    private Long userId;
    
    /**
     * Token único generado para la verificación.
     */
    private String token;
    
    /**
     * Fecha y hora en que expira el token.
     */
    private LocalDateTime expiry;
    
    /**
     * Indica si el token ha sido verificado.
     */
    private boolean verified;
    
    /**
     * Fecha y hora en que se creó el token.
     */
    private LocalDateTime createdAt;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Verifica si el token ha expirado.
     * 
     * @return true si el token ha expirado, false de lo contrario
     */
    public boolean isExpired() {
        return expiry == null || expiry.isBefore(LocalDateTime.now());
    }
}
