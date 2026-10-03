package com.agromarket.application.adapters.api.response.user;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.user.AuthResult;

public record AuthResponse(
        String token,
        String temporaryToken,
        Long userId,
        String email,
        Role role,
        boolean twoFactorRequired) {

    public static AuthResponse from(AuthResult r) {
        return new AuthResponse(r.getToken(), r.getTemporaryToken(), r.getUserId(),
                r.getEmail(), r.getRole(), r.isTwoFactorRequired());
    }

    /**
     * Respuesta del intercambio de cookie por token (login social).
     *
     * <p>El token ya viene firmado y validado por el servidor, que lo dejó en
     * la cookie httpOnly; aquí solo se devuelve al frontend. Los claims del
     * usuario no viajan aquí: el frontend los pide aparte a
     * {@code GET /usuarios/me}, que es la única fuente de verdad del perfil.
     * Por eso {@code userId}, {@code email} y {@code role} van a null y
     * {@code twoFactorRequired} a false.</p>
     */
    public static AuthResponse fromToken(String token) {
        return new AuthResponse(token, null, null, null, null, false);
    }
}
