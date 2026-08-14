package com.agromarket.application.dto.response.user;

import com.agromarket.domain.user.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa la respuesta de autenticación.
 * Contiene el token JWT y datos básicos del usuario autenticado.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String type;
    private Long userId;
    private String firstName;
    private String email;
    private Role role;
    private boolean twoFactorRequired;
    private String tempToken;
    private boolean pendingApproval;
    // Incluido en login para evitar un segundo /me call en el frontend
    private boolean accountComplete;
    private String photoUrl;
    private String lastName;
}
