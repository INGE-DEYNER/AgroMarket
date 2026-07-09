package com.agromarket.domain.ports;

import com.agromarket.application.api.request.LoginRequest;
import com.agromarket.application.api.request.RegistroRequest;
import com.agromarket.application.api.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    AuthResponse loginWithTwoFactor(String tempToken, String codigo);

    void registro(RegistroRequest request);

    String iniciarGoogleOAuth2();

    AuthResponse completarGoogleOAuth2(String email, String nombre, String picture, String rolSolicitado, String googleId);

    com.agromarket.application.api.response.TwoFactorSetupResponse initTwoFactorSetup(Long userId);

    void confirmTwoFactorSetup(Long userId, String codigo);

    void disableTwoFactor(Long userId, String codigo);

    boolean isTwoFactorEnabled(Long userId);

    void verificarEmail(String token);
}
