package com.agromarket.domain.ports.out.user;

/**
 * Puerto de salida para las operaciones criptográficas de autenticación
 * de dos factores.
 */
public interface TwoFactorAuthenticationPort {

    /**
     * Genera un secreto TOTP.
     */
    String generateSecret();

    /**
     * Genera el URI utilizado para configurar un autenticador TOTP.
     *
     * @param email correo asociado a la cuenta
     * @param secret secreto TOTP
     * @return URI de configuración
     */
    String generateQrCodeUri(String email, String secret);

    /**
     * Verifica un código TOTP.
     *
     * @param secret secreto TOTP del usuario
     * @param code código proporcionado por el usuario
     * @return true cuando el código es válido
     */
    boolean verifyCode(String secret, String code);
}