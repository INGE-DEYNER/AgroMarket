package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.PasswordResetConfirmRequest;
import com.agromarket.application.dto.PasswordResetRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.application.dto.VerificarCorreoRequest;
import com.agromarket.application.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final com.agromarket.application.service.PasswordResetService passwordResetService;
    private final com.agromarket.application.service.EmailVerificationService emailVerificationService;
    private final com.agromarket.application.service.RateLimiterService rateLimiterService;

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

    @PostMapping("/enviar-verificacion")
    public ResponseEntity<ApiResponse<Void>> enviarVerificacion(@Valid @RequestBody PasswordResetRequest request) {
        String key = "email-verification:" + request.getCorreo().toLowerCase();
        boolean allowed = rateLimiterService.tryAcquire(key);
        if (allowed) {
            // send only when allowed; service itself is safe and won't reveal existence
            emailVerificationService.sendVerificationEmail(request.getCorreo());
        }
        // Always return generic success to avoid revealing whether the email exists
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

    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse<Void>> verificar(@Valid @RequestBody PasswordResetConfirmRequest request) {
        // reuse PasswordResetConfirmRequest.token field for verification
        emailVerificationService.verifyToken(request.getToken());
        return ok("Correo verificado");
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
}
