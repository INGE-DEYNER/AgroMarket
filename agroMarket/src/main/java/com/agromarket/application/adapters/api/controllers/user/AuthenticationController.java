package com.agromarket.application.adapters.api.controllers.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import com.agromarket.application.adapters.api.request.user.GoogleOAuth2Request;
import com.agromarket.application.adapters.api.request.user.LoginRequest;
import com.agromarket.application.adapters.api.request.user.RegisterRequest;
import com.agromarket.application.adapters.api.request.user.TwoFactorCodeRequest;
import com.agromarket.application.adapters.api.request.user.TwoFactorLoginRequest;
import com.agromarket.application.adapters.api.response.user.AuthResponse;
import com.agromarket.application.adapters.api.response.user.OperationResponse;
import com.agromarket.application.adapters.api.response.user.TwoFactorSetupResponse;
import com.agromarket.application.adapters.api.response.user.TwoFactorStatusResponse;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.user.AuthResult;
import com.agromarket.domain.ports.in.user.AuthenticationPort;
import com.agromarket.domain.ports.in.user.LoginCommand;
import com.agromarket.domain.ports.in.user.RegisterCommand;
import com.agromarket.domain.ports.in.user.TwoFactorSetupResult;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationPort authenticationPort;

    public AuthenticationController(AuthenticationPort authenticationPort) {
        this.authenticationPort = authenticationPort;
    }

    @PostMapping("/register")
    public ResponseEntity<OperationResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        authenticationPort.register(toCommand(request));
        return ResponseEntity.ok(OperationResponse.success("Usuario registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(toResponse(
                authenticationPort.login(new LoginCommand(request.email(), request.password()))));
    }

    @PostMapping("/2fa/login")
    public ResponseEntity<AuthResponse> loginWithTwoFactor(
            @Valid @RequestBody TwoFactorLoginRequest request) {
        return ResponseEntity.ok(toResponse(
                authenticationPort.loginWithTwoFactor(
                        request.temporaryToken(), request.code())));
    }

    @GetMapping("/google")
    public ResponseEntity<String> startGoogleOAuth2() {
        return ResponseEntity.ok(authenticationPort.startGoogleOAuth2());
    }

    @PostMapping("/google/callback")
    public ResponseEntity<AuthResponse> completeGoogleOAuth2(
            @Valid @RequestBody GoogleOAuth2Request request) {
        return ResponseEntity.ok(toResponse(
                authenticationPort.completeGoogleOAuth2(
                        request.code(), request.requestedRole().name())));
    }

    @PostMapping("/2fa/{userId}/setup")
    public ResponseEntity<TwoFactorSetupResponse> initTwoFactorSetup(
            @PathVariable Long userId) {
        return ResponseEntity.ok(toResponse(
                authenticationPort.initTwoFactorSetup(userId)));
    }

    @PostMapping("/2fa/{userId}/confirm")
    public ResponseEntity<OperationResponse> confirmTwoFactorSetup(
            @PathVariable Long userId,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        authenticationPort.confirmTwoFactorSetup(userId, request.code());
        return ResponseEntity.ok(OperationResponse.success("2FA habilitado"));
    }

    @PostMapping("/2fa/{userId}/disable")
    public ResponseEntity<OperationResponse> disableTwoFactor(
            @PathVariable Long userId,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        authenticationPort.disableTwoFactor(userId, request.code());
        return ResponseEntity.ok(OperationResponse.success("2FA deshabilitado"));
    }

    @GetMapping("/2fa/{userId}")
    public ResponseEntity<TwoFactorStatusResponse> isTwoFactorEnabled(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                new TwoFactorStatusResponse(authenticationPort.isTwoFactorEnabled(userId)));
    }

    private RegisterCommand toCommand(RegisterRequest r) {
        return RegisterCommand.builder()
                .firstName(r.firstName()).lastName(r.lastName()).email(r.email())
                .password(r.password()).phone(r.phone()).role(r.role())
                .countryCode(r.countryCode()).location(r.location()).idNumber(r.idNumber())
                .birthDate(r.birthDate()).idType(r.idType()).companyName(r.companyName())
                .nit(r.nit()).isCompany(r.isCompany()).build();
    }

    private AuthResponse toResponse(AuthResult result) {
        return AuthResponse.from(result);
    }

    private TwoFactorSetupResponse toResponse(TwoFactorSetupResult result) {
        return TwoFactorSetupResponse.from(result);
    }
}
