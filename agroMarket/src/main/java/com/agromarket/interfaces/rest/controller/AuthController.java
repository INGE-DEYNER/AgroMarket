package com.agromarket.interfaces.rest.controller;

import com.agromarket.application.dto.ApiResponse;
import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;
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
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Registro exitoso. Revisa tu correo para verificar la cuenta.")
                .data(null)
                .build());
    }

    @PostMapping("/enviar-verificacion")
    public ResponseEntity<ApiResponse<Void>> enviarVerificacion(@Valid @RequestBody com.agromarket.application.dto.PasswordResetRequest request) {
        String key = "email-verification:" + request.getCorreo().toLowerCase();
        boolean allowed = rateLimiterService.tryAcquire(key);
        if (allowed) {
            // send only when allowed; service itself is safe and won't reveal existence
            emailVerificationService.sendVerificationEmail(request.getCorreo());
        }
        // Always return generic success to avoid revealing whether the email exists
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Si la cuenta existe, recibirás un correo de verificación").data(null).build());
    }

    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse<Void>> verificar(@Valid @RequestBody com.agromarket.application.dto.PasswordResetConfirmRequest request) {
        // reuse PasswordResetConfirmRequest.token field for verification
        emailVerificationService.verifyToken(request.getToken());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Correo verificado").data(null).build());
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<ApiResponse<Void>> recuperarContrasena(@Valid @RequestBody com.agromarket.application.dto.PasswordResetRequest request) {
        passwordResetService.requestPasswordReset(request.getCorreo());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Correo de recuperación enviado").data(null).build());
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<ApiResponse<Void>> restablecerContrasena(@Valid @RequestBody com.agromarket.application.dto.PasswordResetConfirmRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNuevaContrasena());
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Contraseña restablecida").data(null).build());
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Sesión cerrada en el cliente")
                .data(null)
                .build());
    }
}
