package com.agromarket.application.service;

public interface PasswordResetService {
    void requestPasswordReset(String correo);

    void resetPassword(String token, String nuevaContrasena);
}
