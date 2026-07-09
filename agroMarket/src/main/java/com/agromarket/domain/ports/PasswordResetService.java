package com.agromarket.domain.ports;

public interface PasswordResetService {
    void requestPasswordReset(String correo);
    String verifyCode(String correo, String codigo);
    void resetPassword(String token, String nuevaContrasena);
}
