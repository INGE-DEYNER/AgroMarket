package com.agromarket.infrastructure.security;

import com.agromarket.domain.user.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clase que representa el principal de usuario para JWT.
 * Contiene la información básica del usuario extraída del token JWT.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtUserPrincipal {
    private Long userId;
    private String email;
    private Role role;

    /**
     * Obtiene el ID del usuario.
     * 
     * @return ID del usuario
     */
    public Long getUserId() {
        return this.userId;
    }
}
