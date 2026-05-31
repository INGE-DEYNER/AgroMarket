package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.EmailVerificationRequest;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.PasswordResetConfirmRequest;
import com.agromarket.application.dto.PasswordResetRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.application.dto.VerificarCorreoRequest;
import com.agromarket.application.service.AuthService;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
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
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Inicio de sesión exitoso")
                .data(authService.login(request))
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
    public ResponseEntity<ApiResponse<Void>> verificarCorreo(@Valid @RequestBody VerificarCorreoRequest request) {
        emailVerificationService.verifyCode(request.getCorreo(), request.getCodigo());
        return ok("Correo verificado");
    }

    // #4 — uses dedicated DTO with only the token field, no nuevaContrasena
    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse<Void>> verificar(@Valid @RequestBody EmailVerificationRequest request) {
        emailVerificationService.verifyToken(request.getToken());
        return ok("Correo verificado");
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
        return ok("Correo de recuperación enviado");
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<ApiResponse<Void>> restablecerContrasena(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNuevaContrasena());
        return ok("Contraseña restablecida");
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
                .sameSite("Strict")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
