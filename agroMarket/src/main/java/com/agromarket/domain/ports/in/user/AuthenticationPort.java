package com.agromarket.domain.ports.in.user;

/**
 * Puerto de entrada para las operaciones de autenticación.
 */
public interface AuthenticationPort {

        AuthResult login(LoginCommand command);

        AuthResult loginWithTwoFactor(
                        String tempToken,
                        String code);

        void register(RegisterCommand command);

        void reenviarVerificacion(String email);

        void solicitarRecuperacionContrasena(String email);

        void verificarRecuperacionContrasena(
                        String email,
                        String token);

        void restablecerContrasena(
                        String email,
                        String token,
                        String newPassword);

        String startGoogleOAuth2();

        AuthResult completeGoogleOAuth2(
                        String code,
                        String requestedRole);

        TwoFactorSetupResult initTwoFactorSetup(
                        Long userId);

        void confirmTwoFactorSetup(
                        Long userId,
                        String code);

        void disableTwoFactor(
                        Long userId,
                        String code);

        boolean isTwoFactorEnabled(
                        Long userId);
}