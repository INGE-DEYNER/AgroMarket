package com.agromarket.interfaces.rest.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.agromarket.application.dto.request.user.EmailVerificationRequest;
import com.agromarket.application.dto.request.user.LoginRequest;
import com.agromarket.application.dto.request.user.PasswordResetConfirmRequest;
import com.agromarket.application.dto.request.user.PasswordResetRequest;
import com.agromarket.application.dto.request.user.RegisterRequest;
import com.agromarket.application.dto.request.user.TwoFactorCodeRequest;
import com.agromarket.application.dto.request.user.TwoFactorLoginRequest;
import com.agromarket.application.dto.response.user.AuthResponse;
import com.agromarket.application.dto.response.user.TwoFactorSetupResponse;
import com.agromarket.application.dto.shared.ApiResponse;
import com.agromarket.domain.user.ports.in.AuthenticationService;
import com.agromarket.domain.user.ports.in.EmailVerificationService;
import com.agromarket.domain.user.ports.in.PasswordResetService;
import com.agromarket.infrastructure.config.properties.AppProperties;
import com.agromarket.infrastructure.security.JwtTokenProvider;
import com.agromarket.infrastructure.security.SafeRedirectUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * Controlador REST que gestiona las operaciones de autenticación.
 * Incluye endpoints para login, registro, recuperación de contraseña,
 * verificación de correo y autenticación de dos factores.
 * 
 * @author AgroMarket Team
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Operaciones de autenticación y registro de usuarios")
public class AuthController {

    private final AuthenticationPort authenticationService;
    private final PasswordResetPort passwordResetService;
    private final EmailVerificationPort emailVerificationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SafeRedirectUtil safeRedirectUtil;
    private final AppProperties appProperties;
    
    private static final String OAUTH2_TEMP_COOKIE = "agromarket_oauth2_token";
    
    /**
     * Inicia sesión con correo y contraseña.
     * 
     * @param request datos de login (correo y contraseña)
     * @return respuesta con token de autenticación
     */
    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario con correo y contraseña")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message(auth.isTwoFactorRequired() ? "Verificación en dos pasos requerida" : "Inicio de sesión exitoso")
                .data(auth)
                .build());
    }
    
    /**
     * Inicia sesión con autenticación de dos factores.
     * 
     * @param request datos de login con 2FA (token temporal y código)
     * @return respuesta con token de autenticación
     */
    @PostMapping("/login-2fa")
    @Operation(summary = "Iniciar sesión con 2FA", description = "Completa el inicio de sesión con autenticación de dos factores")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithTwoFactor(@Valid @RequestBody TwoFactorLoginRequest request) {
        AuthResponse auth = authenticationService.loginWithTwoFactor(request.getTempToken(), request.getCode());
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Inicio de sesión exitoso")
                .data(auth)
                .build());
    }
    
    /**
     * Registra un nuevo usuario.
     * 
     * @param request datos de registro del usuario
     * @return confirmación de registro
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar usuario", description = "Crea una nueva cuenta de usuario")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authenticationService.register(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Registro exitoso. Revisa tu correo para verificar la cuenta.")
                .build());
    }
    
    /**
     * Inicia el flujo de autenticación con Google OAuth2.
     * 
     * @return redirección a Google para autenticación
     */
    @GetMapping("/google")
    @Operation(summary = "Iniciar autenticación con Google", description = "Redirige a Google para autenticación OAuth2")
    public RedirectView startGoogleOAuth2() {
        return new RedirectView(authenticationService.startGoogleOAuth2());
    }
    
    /**
     * Callback de Google OAuth2 después de autenticación exitosa.
     * 
     * @param code código de autorización de Google
     * @param state estado CSRF
     * @param request solicitud HTTP
     * @param response respuesta HTTP
     * @return redirección con token
     */
    @GetMapping("/google/callback")
    @Operation(hidden = true)
    public RedirectView googleOAuth2Callback(
            @RequestParam String code, 
            @RequestParam(required = false) String state,
            HttpServletRequest request, HttpServletResponse response) {
        // Implementación simplificada - en producción integrar con Spring Security OAuth2
        return safeRedirectUtil.getRedirectView("/login?google=success");
    }
    
    /**
     * Solicita recuperación de contraseña.
     * 
     * @param request correo electrónico para recuperación
     * @return confirmación de solicitud
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperación de contraseña", description = "Envía un correo con instrucciones para restablecer la contraseña")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.")
                .build());
    }
    
    /**
     * Restablece la contraseña usando un token.
     * 
     * @param request token y nueva contraseña
     * @return confirmación de restablecimiento
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Restablecer contraseña", description = "Restablece la contraseña usando un token de recuperación")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.")
                .build());
    }
    
    /**
     * Verifica el correo electrónico usando un token.
     * 
     * @param token token de verificación
     * @return confirmación de verificación
     */
    @GetMapping("/verify-email")
    @Operation(summary = "Verificar correo electrónico", description = "Verifica el correo electrónico usando un token de verificación")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Correo electrónico verificado exitosamente.")
                .build());
    }
    
    /**
     * Reenvía el correo de verificación.
     * 
     * @param request correo electrónico
     * @return confirmación de reenvío
     */
    @PostMapping("/resend-verification")
    @Operation(summary = "Reenviar verificación de correo", description = "Reenvía el correo de verificación")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody EmailVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Correo de verificación reenviado. Revisa tu bandeja de entrada.")
                .build());
    }
    
    /**
     * Inicializa la configuración de autenticación de dos factores.
     * 
     * @param userId ID del usuario
     * @return información para configurar 2FA (QR code, secreto)
     */
    @PostMapping("/2fa/setup")
    @Operation(summary = "Iniciar configuración de 2FA", description = "Prepara la configuración de autenticación de dos factores")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> setupTwoFactor(@RequestParam Long userId) {
        TwoFactorSetupResponse setup = authenticationService.initTwoFactorSetup(userId);
        return ResponseEntity.ok(ApiResponse.<TwoFactorSetupResponse>builder()
                .success(true)
                .message("Escanea el código QR con tu aplicación de autenticación")
                .data(setup)
                .build());
    }
    
    /**
     * Confirma la configuración de autenticación de dos factores.
     * 
     * @param userId ID del usuario
     * @param code código de verificación
     * @return confirmación
     */
    @PostMapping("/2fa/confirm")
    @Operation(summary = "Confirmar configuración de 2FA", description = "Confirma la configuración de autenticación de dos factores")
    public ResponseEntity<ApiResponse<Void>> confirmTwoFactor(
            @RequestParam Long userId, 
            @RequestParam String code) {
        authenticationService.confirmTwoFactorSetup(userId, code);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Autenticación de dos factores habilitada exitosamente")
                .build());
    }
    
    /**
     * Deshabilita la autenticación de dos factores.
     * 
     * @param userId ID del usuario
     * @param code código de verificación
     * @return confirmación
     */
    @PostMapping("/2fa/disable")
    @Operation(summary = "Deshabilitar 2FA", description = "Deshabilita la autenticación de dos factores")
    public ResponseEntity<ApiResponse<Void>> disableTwoFactor(
            @RequestParam Long userId, 
            @RequestParam String code) {
        authenticationService.disableTwoFactor(userId, code);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Autenticación de dos factores deshabilitada")
                .build());
    }
}
