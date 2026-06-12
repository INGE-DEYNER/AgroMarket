package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.EmailVerificationRequest;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.PasswordResetConfirmRequest;
import com.agromarket.application.dto.PasswordResetRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.application.dto.TwoFactorCodeRequest;
import com.agromarket.application.dto.TwoFactorLoginRequest;
import com.agromarket.application.dto.TwoFactorSetupResponse;
import com.agromarket.application.dto.VerificarCorreoRequest;
import com.agromarket.application.dto.VerifyCodeRequest;
import com.agromarket.application.service.AuthService;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtUserPrincipal;
import com.agromarket.infrastructure.security.JwtTokenProvider;

import java.util.Arrays;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class AuthController {
    private final AuthService authService;
    private final com.agromarket.application.service.PasswordResetService passwordResetService;
    private final com.agromarket.application.service.EmailVerificationService emailVerificationService;
    private final com.agromarket.application.service.RateLimiterService rateLimiterService;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String OAUTH2_TEMP_COOKIE = "agromarket_oauth2_token";

    private ResponseEntity<ApiResponse<Void>> ok(String message) {
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .data(null)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
            .message(auth.isTwoFactorRequired() ? "Verificación en dos pasos requerida" : "Inicio de sesión exitoso")
            .data(auth)
                .build());
    }

        @PostMapping("/login-2fa")
        public ResponseEntity<ApiResponse<AuthResponse>> login2fa(@Valid @RequestBody TwoFactorLoginRequest request) {
        AuthResponse auth = authService.loginWithTwoFactor(request.getTempToken(), request.getCodigo());
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
            .success(true)
            .message("Inicio de sesión exitoso")
            .data(auth)
            .build());
        }

    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<Void>> registro(@Valid @RequestBody RegistroRequest request) {
        authService.registro(request);
        return ok("Registro exitoso. Revisa tu correo para verificar la cuenta.");
    }

    @GetMapping("/google")
    public RedirectView iniciarGoogle() {
        return new RedirectView(authService.iniciarGoogleOAuth2());
    }

    @PostMapping("/enviar-verificacion")
    public ResponseEntity<ApiResponse<Void>> enviarVerificacion(@Valid @RequestBody PasswordResetRequest request) {
        String key = "email-verification:" + request.getCorreo().toLowerCase();
        boolean allowed = rateLimiterService.tryAcquire(key);
        if (allowed) {
            emailVerificationService.sendVerificationEmail(request.getCorreo());
        }
        return ok("Si la cuenta existe, recibirás un correo de verificación");
    }

    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<ApiResponse<Void>> reenviarVerificacion(@Valid @RequestBody PasswordResetRequest request) {
        return enviarVerificacion(request);
    }

    @PostMapping("/verificar-correo")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> verificarCorreo(@Valid @RequestBody VerificarCorreoRequest request) {
        com.agromarket.infrastructure.persistence.entity.UsuarioEntity usuario = emailVerificationService.verifyCode(request.getCorreo(), request.getCodigo());
        boolean pendiente = usuario.getRol() != null && usuario.getRol().name().equals("PRODUCTOR");
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, Boolean>>builder()
                .success(true)
                .message(pendiente ? "Correo verificado. Tu cuenta está pendiente de aprobación por un administrador." : "Correo verificado")
                .data(java.util.Map.of("pendiente", pendiente))
                .build());
    }

    // #4 — uses dedicated DTO with only the token field, no nuevaContrasena
    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> verificar(@Valid @RequestBody EmailVerificationRequest request) {
        com.agromarket.infrastructure.persistence.entity.UsuarioEntity usuario = emailVerificationService.verifyToken(request.getToken());
        boolean pendiente = usuario.getRol() != null && usuario.getRol().name().equals("PRODUCTOR");
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, Boolean>>builder()
                .success(true)
                .message(pendiente ? "Correo verificado. Tu cuenta está pendiente de aprobación por un administrador." : "Correo verificado")
                .data(java.util.Map.of("pendiente", pendiente))
                .build());
    }

    @PostMapping("/2fa/setup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> initTwoFactorSetup(@AuthenticationPrincipal JwtUserPrincipal principal) {
        TwoFactorSetupResponse response = authService.initTwoFactorSetup(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<TwoFactorSetupResponse>builder()
                .success(true)
                .message("Escanea el QR o usa la clave manual en tu Authenticator")
                .data(response)
                .build());
    }

    @PostMapping("/2fa/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> confirmTwoFactorSetup(@AuthenticationPrincipal JwtUserPrincipal principal,
                                                                   @Valid @RequestBody TwoFactorCodeRequest request) {
        authService.confirmTwoFactorSetup(principal.getUserId(), request.getCodigo());
        return ok("Autenticación en dos pasos activada");
    }

    @PostMapping("/2fa/disable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> disableTwoFactor(@AuthenticationPrincipal JwtUserPrincipal principal,
                                                              @Valid @RequestBody TwoFactorCodeRequest request) {
        authService.disableTwoFactor(principal.getUserId(), request.getCodigo());
        return ok("Autenticación en dos pasos desactivada");
    }

    @GetMapping("/2fa/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> twoFactorStatus(@AuthenticationPrincipal JwtUserPrincipal principal) {
        boolean enabled = authService.isTwoFactorEnabled(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, Boolean>>builder()
                .success(true)
                .message("Estado de autenticación en dos pasos")
                .data(java.util.Map.of("enabled", enabled))
                .build());
    }

    @GetMapping("/token-exchange")
    public ResponseEntity<ApiResponse<AuthResponse>> tokenExchange(HttpServletRequest request, HttpServletResponse response) {
        String token = getCookieValue(request, OAUTH2_TEMP_COOKIE);
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            throw new com.agromarket.domain.exception.CredencialesInvalidasException("No hay una sesión temporal de OAuth2 válida");
        }

        Long userId = jwtTokenProvider.extractUserId(token);
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("Usuario no encontrado"));

        if (!usuario.isActivo() || (usuario.getRol() != null && usuario.getRol().name().equals("PRODUCTOR") && !usuario.isAprobado())) {
            throw new com.agromarket.domain.exception.AccesoDenegadoException("La cuenta no está activa o está pendiente de aprobación");
        }

        clearCookie(response, request, OAUTH2_TEMP_COOKIE);

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .userId(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .build();

        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Token intercambiado correctamente")
                .data(authResponse)
                .build());
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<ApiResponse<Void>> recuperarContrasena(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.requestPasswordReset(request.getCorreo());
        return ok("Si la cuenta existe, recibirás un código de recuperación");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        String tokenTemporal = passwordResetService.verifyCode(request.getCorreo(), request.getCodigo());
        return ResponseEntity.ok(ApiResponse.<java.util.Map<String, String>>builder()
                .success(true)
                .message("Código verificado")
                .data(java.util.Map.of("tempToken", tokenTemporal))
                .build());
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<ApiResponse<Void>> restablecerContrasena(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNuevaContrasena());
        return ok("Contraseña restablecida exitosamente");
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ok("Sesión cerrada en el cliente");
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void clearCookie(HttpServletResponse response, HttpServletRequest request, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite("None")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
