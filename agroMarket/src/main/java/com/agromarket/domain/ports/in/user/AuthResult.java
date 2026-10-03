package com.agromarket.domain.ports.in.user;

import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Resultado de una operación de autenticación.
 *
 * <p>No contiene contraseña ni secretos TOTP.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResult {

    private String token;

    private String temporaryToken;

    private Long userId;

    private String email;

    private Role role;

    private boolean twoFactorRequired;
}