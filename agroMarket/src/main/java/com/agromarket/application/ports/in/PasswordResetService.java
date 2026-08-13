package com.agromarket.application.ports.in;

public interface PasswordResetService {
    void requestPasswordReset(String correo);
    String verifyCode(String correo, String codigo);
    void resetPassword(String token, String nuevaContrasena);
}
