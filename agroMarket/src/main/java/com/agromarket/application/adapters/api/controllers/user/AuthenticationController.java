package com.agromarket.application.adapters.api.controllers.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.GoogleOAuth2Request;
import com.agromarket.application.adapters.api.request.user.LoginRequest;
import com.agromarket.application.adapters.api.request.user.PasswordRecoveryRequest;
import com.agromarket.application.adapters.api.request.user.RegisterRequest;
import com.agromarket.application.adapters.api.request.user.ResendVerificationRequest;
import com.agromarket.application.adapters.api.request.user.ResetPasswordRequest;
import com.agromarket.application.adapters.api.request.user.TwoFactorCodeRequest;
import com.agromarket.application.adapters.api.request.user.TwoFactorLoginRequest;
import com.agromarket.application.adapters.api.request.user.VerifyPasswordRecoveryRequest;

import com.agromarket.application.adapters.api.response.user.AuthResponse;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.application.adapters.api.response.user.TwoFactorSetupResponse;
import com.agromarket.application.adapters.api.response.user.TwoFactorStatusResponse;

import com.agromarket.domain.ports.in.user.AuthResult;
import com.agromarket.domain.ports.in.user.AuthenticationPort;
import com.agromarket.domain.ports.in.user.LoginCommand;
import com.agromarket.domain.ports.in.user.RegisterCommand;
import com.agromarket.domain.ports.in.user.TwoFactorSetupResult;

@RestController
@RequestMapping({
        "/api/v1/auth",
        "/api/auth"
})
public class AuthenticationController {

    private final AuthenticationPort authenticationPort;

    public AuthenticationController(AuthenticationPort authenticationPort) {
        this.authenticationPort = authenticationPort;
    }

    // =========================================================
    // REGISTRO
    // =========================================================

    @PostMapping({
            "/register",
            "/registro"
    })
    public ResponseEntity<OperationResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        authenticationPort.register(toCommand(request));

        return ResponseEntity.ok(
                OperationResponse.success(
                        "Usuario registrado correctamente"));
    }

    // =========================================================
    // VERIFICACIÓN DE CORREO
    // =========================================================

    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<OperationResponse> reenviarVerificacion(
            @Valid @RequestBody ResendVerificationRequest request) {

        authenticationPort.reenviarVerificacion(
                request.email());

        return ResponseEntity.ok(
                OperationResponse.success(
                        "Código de verificación reenviado correctamente"));
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResult result = authenticationPort.login(
                new LoginCommand(
                        request.email(),
                        request.password()));

        return ResponseEntity.ok(
                toResponse(result));
    }

    // =========================================================
    // 2FA LOGIN
    // =========================================================

    @PostMapping("/2fa/login")
    public ResponseEntity<AuthResponse> loginWithTwoFactor(
            @Valid @RequestBody TwoFactorLoginRequest request) {

        AuthResult result = authenticationPort.loginWithTwoFactor(
                request.temporaryToken(),
                request.code());

        return ResponseEntity.ok(
                toResponse(result));
    }

    // =========================================================
    // GOOGLE
    // =========================================================

    @GetMapping("/google")
    public ResponseEntity<String> startGoogleOAuth2() {

        return ResponseEntity.ok(
                authenticationPort.startGoogleOAuth2());
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthResponse> completeGoogleOAuth2(
            @Valid @RequestBody GoogleOAuth2Request request) {

        AuthResult result = authenticationPort.completeGoogleOAuth2(
                request.code(),
                request.requestedRole().name());

        return ResponseEntity.ok(
                toResponse(result));
    }

    // =========================================================
    // 2FA
    // =========================================================

    @PostMapping("/2fa/{userId}/setup")
    public ResponseEntity<TwoFactorSetupResponse> initTwoFactorSetup(
            @PathVariable Long userId) {

        TwoFactorSetupResult result = authenticationPort.initTwoFactorSetup(userId);

        return ResponseEntity.ok(
                toResponse(result));
    }

    @PostMapping("/2fa/{userId}/confirm")
    public ResponseEntity<OperationResponse> confirmTwoFactorSetup(
            @PathVariable Long userId,
            @Valid @RequestBody TwoFactorCodeRequest request) {

        authenticationPort.confirmTwoFactorSetup(
                userId,
                request.code());

        return ResponseEntity.ok(
                OperationResponse.success(
                        "2FA habilitado"));
    }

    @PostMapping("/2fa/{userId}/disable")
    public ResponseEntity<OperationResponse> disableTwoFactor(
            @PathVariable Long userId,
            @Valid @RequestBody TwoFactorCodeRequest request) {

        authenticationPort.disableTwoFactor(
                userId,
                request.code());

        return ResponseEntity.ok(
                OperationResponse.success(
                        "2FA deshabilitado"));
    }

    @GetMapping("/2fa/{userId}")
    public ResponseEntity<TwoFactorStatusResponse> isTwoFactorEnabled(
            @PathVariable Long userId) {

        boolean enabled = authenticationPort.isTwoFactorEnabled(userId);

        return ResponseEntity.ok(
                new TwoFactorStatusResponse(enabled));
    }

    // =========================================================
    // CONVERSIONES
    // =========================================================

    private RegisterCommand toCommand(
            RegisterRequest request) {

        return RegisterCommand.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(request.password())
                .phone(request.phone())
                .role(request.role())
                .countryCode(request.countryCode())
                .location(request.location())
                .idNumber(request.idNumber())
                .birthDate(request.birthDate())
                .idType(request.idType())
                .companyName(request.companyName())
                .nit(request.nit())
                .isCompany(request.isCompany())
                .build();
    }

    private AuthResponse toResponse(
            AuthResult result) {

        return AuthResponse.from(result);
    }

    private TwoFactorSetupResponse toResponse(
            TwoFactorSetupResult result) {

        return TwoFactorSetupResponse.from(result);
    }
}