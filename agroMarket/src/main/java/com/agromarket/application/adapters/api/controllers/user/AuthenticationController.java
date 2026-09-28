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

import com.agromarket.domain.ports.in.user.EmailVerificationPort;

@RestController
@RequestMapping({
        "/api/v1/auth",
        "/api/auth"
})
public class AuthenticationController {

    private final AuthenticationPort authenticationPort;
    private final EmailVerificationPort emailVerificationPort;

    public AuthenticationController(
            AuthenticationPort authenticationPort,
            EmailVerificationPort emailVerificationPort) {
        this.authenticationPort = authenticationPort;
        this.emailVerificationPort = emailVerificationPort;
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

    @PostMapping({
            "/verificar",
            "/verificar-correo",
            "/verify",
            "/verify-email"
    })
    public ResponseEntity<OperationResponse> verificarCorreo(
            @RequestBody java.util.Map<String, Object> body) {

        String token = null;
        if (body != null) {
            if (body.get("token") != null) token = String.valueOf(body.get("token"));
            else if (body.get("codigo") != null) token = String.valueOf(body.get("codigo"));
            else if (body.get("code") != null) token = String.valueOf(body.get("code"));
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(
                    OperationResponse.error("Token de verificación no proporcionado"));
        }

        emailVerificationPort.verifyEmail(token.trim());

        return ResponseEntity.ok(
                OperationResponse.success(
                        "Correo verificado correctamente"));
    }

    @PostMapping({
            "/reenviar-verificacion",
            "/reenviar-correo"
    })
    public ResponseEntity<OperationResponse> reenviarVerificacion(
            @RequestBody java.util.Map<String, Object> body) {

        String email = null;
        if (body != null) {
            if (body.get("email") != null) email = String.valueOf(body.get("email"));
            else if (body.get("correo") != null) email = String.valueOf(body.get("correo"));
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    OperationResponse.error("Correo electrónico no proporcionado"));
        }

        emailVerificationPort.resendVerificationEmail(email.trim());

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
                .idNumber(request.idNumber())
                .birthDate(request.birthDate())
                .idType(request.idType())
                .companyName(request.companyName())
                .nit(request.nit())
                .build();
    }

    private AuthResponse toResponse(
            AuthResult result) {

        return AuthResponse.from(result);
    }
    // =========================================================
    // CIERRE DE SESIÓN
    // =========================================================

    /**
     * POST /api/v1/auth/logout — cierre de sesión.
     *
     * <p>El frontend lo invoca desde {@code AuthContext.logout()}. El JWT es
     * sin estado, así que no hay lista de revocación que consultar: lo que
     * queda por invalidar es la cookie de sesión httpOnly que emite el
     * flujo OAuth2 de Google. Limpiarla aquí es lo que realmente cierra la
     * sesión en el servidor; el {@code localStorage} lo borra el frontend.</p>
     *
     * <p>Siempre responde 200, incluso sin cookie, para que cerrar sesión
     * nunca falle por un error de red.</p>
     */
    @PostMapping({ "/logout", "/salir" })
    public ResponseEntity<OperationResponse> logout(
            jakarta.servlet.http.HttpServletResponse response) {

        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie(
                "AGROMARKET_SESSION",
                "");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return ResponseEntity.ok(
                OperationResponse.success("Sesión cerrada correctamente"));
    }

    // =========================================================
    // INTERCAMBIO DE TOKEN (OAuth2)
    // =========================================================

    /**
     * GET /api/v1/auth/token-exchange — entrega el JWT tras el login social.
     *
     * <p>Flujo de Google: el backend recibe el código, lo canjea y deja el JWT
     * únicamente en una cookie httpOnly (nunca en la URL, para que no quede
     * en el historial ni en los logs). El frontend vuelve a esta ruta para
     * recuperar el token y guardarlo en memoria.</p>
     *
     * <p>Si no hay cookie, responde 401: el frontend lo interpreta como
     * "el login social no se completó" y cae al formulario normal.</p>
     */
    @GetMapping("/token-exchange")
    public ResponseEntity<AuthResponse> tokenExchange(
            @CookieValue(
                    name = "AGROMARKET_SESSION",
                    required = false) String sessionToken) {

        if (sessionToken == null || sessionToken.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                AuthResponse.fromToken(sessionToken));
    }


    private TwoFactorSetupResponse toResponse(
            TwoFactorSetupResult result) {

        return TwoFactorSetupResponse.from(result);
    }
}