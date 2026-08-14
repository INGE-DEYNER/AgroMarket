package com.agromarket.domain.user.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Entidad de dominio que representa un token de recuperación de contraseña.
 * Se utiliza para permitir a los usuarios restablecer su contraseña de forma segura.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    
    private Long id;
    
    /**
     * ID del usuario asociado al token.
     */
    private Long userId;
    
    /**
     * Token único generado para el restablecimiento de contraseña.
     */
    private String token;
    
    /**
     * Fecha y hora en que expira el token.
     */
    private LocalDateTime expiry;
    
    /**
     * Indica si el token ya ha sido utilizado.
     */
    private boolean used;
    
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
    
    /**
     * Marca el token como utilizado.
     */
    public void markAsUsed() {
        this.used = true;
    }
}
