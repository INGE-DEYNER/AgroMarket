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
}
