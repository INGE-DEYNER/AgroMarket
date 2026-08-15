package com.agromarket.domain.ports.in.user;


 import org.springframework.transaction.annotation.Transactional;

 /**
  * Puerto de entrada que define las operaciones de autenticación.
  * Incluye métodos para inicio de sesión, registro, autenticación con proveedores externos
  * y gestión de autenticación de dos factores (2FA).
 * 
 * @author AgroMarket Team
  */
 public interface AuthenticationPort {


     /**
      * Inicia sesión con correo y contraseña.
     *
     * @param command datos de autenticación
     * @return resultado de autenticación
      */

    AuthResult login(LoginCommand command);

     /**
      * Inicia sesión con autenticación de dos factores.

     *
      * @param tempToken token temporal
      * @param code código de autenticación de dos factores

     * @return resultado de autenticación
      */
 
    AuthResult loginWithTwoFactor(String tempToken, String code);

     /**
      * Registra un nuevo usuario en el sistema.

     *
     * @param command datos de registro
      */
     @Transactional

    void register(RegisterCommand command);

     /**
      * Inicia el flujo de autenticación con Google OAuth2.

     *
      * @return URL de redirección para Google OAuth2
      */
     String startGoogleOAuth2();


     /**
      * Completa el flujo de autenticación con Google OAuth2.

     *
     * @param code código devuelto por Google OAuth2
     * @param requestedRole rol solicitado por el usuario
     * @return resultado de autenticación
      */

    AuthResult completeGoogleOAuth2(String code, String requestedRole);

     /**
      * Inicializa la configuración de autenticación de dos factores para un usuario.

     *
      * @param userId ID del usuario
     * @return información necesaria para configurar 2FA
      */
    
    TwoFactorSetupResult initTwoFactorSetup(Long userId);

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

 }