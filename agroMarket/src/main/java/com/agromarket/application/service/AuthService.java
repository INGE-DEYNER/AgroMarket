package com.agromarket.application.service;

import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    AuthResponse loginWithTwoFactor(String tempToken, String codigo);

    void registro(RegistroRequest request);

    String iniciarGoogleOAuth2();

    AuthResponse completarGoogleOAuth2(String email, String nombre, String picture);

    com.agromarket.application.dto.TwoFactorSetupResponse initTwoFactorSetup(Long userId);

    void confirmTwoFactorSetup(Long userId, String codigo);

    void disableTwoFactor(Long userId, String codigo);

    boolean isTwoFactorEnabled(Long userId);
}
