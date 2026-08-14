package com.agromarket.domain.user.ports.in;

import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.dto.request.user.LoginRequest;
import com.agromarket.application.dto.request.user.RegisterRequest;
import com.agromarket.application.dto.response.user.AuthResponse;
import com.agromarket.application.dto.response.user.TwoFactorSetupResponse;

/**
 * Puerto de entrada que define las operaciones de autenticación.
 * Incluye métodos para inicio de sesión, registro, autenticación con proveedores externos
 * y gestión de autenticación de dos factores (2FA).
 * 
 * @author AgroMarket Team
 */
public interface AuthenticationService {
    
    /**
     * Inicia sesión con correo y contraseña.
     * 
     * @param request datos de login (correo y contraseña)
     * @return respuesta con los datos de autenticación (token, usuario, etc.)
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * Inicia sesión con autenticación de dos factores.
     * 
     * @param tempToken token temporal
     * @param code código de autenticación de dos factores
     * @return respuesta con los datos de autenticación
     */
    AuthResponse loginWithTwoFactor(String tempToken, String code);
    
    /**
     * Registra un nuevo usuario en el sistema.
     * 
     * @param request datos de registro del usuario
     */
    @Transactional
    void register(RegisterRequest request);
    
    /**
     * Inicia el flujo de autenticación con Google OAuth2.
     * 
     * @return URL de redirección para Google OAuth2
     */
    String startGoogleOAuth2();
    
    /**
     * Completa el flujo de autenticación con Google OAuth2.
     * 
     * @param email correo del usuario de Google
     * @param firstName nombre del usuario
     * @param picture URL de la foto de perfil
     * @param requestedRole rol solicitado por el usuario
     * @param googleId ID único de Google del usuario
     * @return respuesta con los datos de autenticación
     */
    AuthResponse completeGoogleOAuth2(String email, String firstName, String picture, 
                                     String requestedRole, String googleId);
    
    /**
     * Inicializa la configuración de autenticación de dos factores para un usuario.
     * 
     * @param userId ID del usuario
     * @return respuesta con la información para configurar 2FA (QR code, secreto, etc.)
     */
    TwoFactorSetupResponse initTwoFactorSetup(Long userId);
    
    /**
     * Confirma la configuración de autenticación de dos factores.
     * 
     * @param userId ID del usuario
     * @param code código de verificación para confirmar la configuración
     */
    void confirmTwoFactorSetup(Long userId, String code);
    
    /**
     * Deshabilita la autenticación de dos factores para un usuario.
     * 
     * @param userId ID del usuario
     * @param code código de verificación para autorizar la deshabilitación
     */
    void disableTwoFactor(Long userId, String code);
    
    /**
     * Verifica si un usuario tiene la autenticación de dos factores habilitada.
     * 
     * @param userId ID del usuario
     * @return true si 2FA está habilitada, false de lo contrario
     */
    boolean isTwoFactorEnabled(Long userId);
    
    /**
     * Verifica el correo electrónico de un usuario usando un token.
     * 
     * @param token token de verificación
     */
    void verifyEmail(String token);
}
