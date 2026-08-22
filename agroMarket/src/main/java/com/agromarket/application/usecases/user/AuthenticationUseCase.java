package com.agromarket.application.usecases.user;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.AuthAccessEvent;
import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.user.AuthResult;
import com.agromarket.domain.ports.in.user.AuthenticationPort;
import com.agromarket.domain.ports.in.user.LoginCommand;
import com.agromarket.domain.ports.in.user.RegisterCommand;
import com.agromarket.domain.ports.in.user.TwoFactorSetupResult;
import com.agromarket.domain.ports.out.user.AuthEventPort;
import com.agromarket.domain.ports.out.user.AuthenticationTokenPort;
import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.domain.ports.out.user.GoogleOAuth2Port;
import com.agromarket.domain.ports.out.user.PasswordHashPort;
import com.agromarket.domain.ports.out.user.TwoFactorAuthenticationPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.services.user.PasswordPolicyService;
import com.agromarket.domain.services.user.TwoFactorService;
import com.agromarket.domain.services.user.UserService;

@Service
@Transactional
public class AuthenticationUseCase implements AuthenticationPort {

        private final UserPort userPort;
        private final AuthEventPort authEventPort;
        private final PasswordHashPort passwordHashPort;
        private final AuthenticationTokenPort authenticationTokenPort;
        private final TwoFactorAuthenticationPort twoFactorAuthenticationPort;
        private final EmailPort emailPort;
        private final GoogleOAuth2Port googleOAuth2Port;
        private final UserService userService;
        private final PasswordPolicyService passwordPolicyService;
        private final TwoFactorService twoFactorService;

        public AuthenticationUseCase(
                        UserPort userPort,
                        AuthEventPort authEventPort,
                        PasswordHashPort passwordHashPort,
                        AuthenticationTokenPort authenticationTokenPort,
                        TwoFactorAuthenticationPort twoFactorAuthenticationPort,
                        EmailPort emailPort,
                        GoogleOAuth2Port googleOAuth2Port,
                        UserService userService,
                        PasswordPolicyService passwordPolicyService,
                        TwoFactorService twoFactorService) {

                this.userPort = userPort;
                this.authEventPort = authEventPort;
                this.passwordHashPort = passwordHashPort;
                this.authenticationTokenPort = authenticationTokenPort;
                this.twoFactorAuthenticationPort = twoFactorAuthenticationPort;
                this.emailPort = emailPort;
                this.googleOAuth2Port = googleOAuth2Port;
                this.userService = userService;
                this.passwordPolicyService = passwordPolicyService;
                this.twoFactorService = twoFactorService;
        }

        // =========================================================
        // LOGIN
        // =========================================================

        @Override
        public AuthResult login(LoginCommand command) {

                String email = normalizeEmail(command.getEmail());

                User user = userPort.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Credenciales inválidas"));

                if (!userService.canLogin(user)
                                || !passwordHashPort.matches(
                                                command.getPassword(),
                                                user.getPassword())) {

                        log(
                                        user,
                                        "LOGIN",
                                        false,
                                        "Credenciales inválidas");

                        throw new IllegalArgumentException(
                                        "Credenciales inválidas");
                }

                if (twoFactorService.isEnabled(user)) {

                        String temporaryToken = authenticationTokenPort
                                        .generateTemporary(user);

                        log(
                                        user,
                                        "LOGIN_2FA_REQUIRED",
                                        true,
                                        "Segundo factor requerido");

                        return AuthResult.builder()
                                        .temporaryToken(temporaryToken)
                                        .userId(user.getId())
                                        .email(user.getEmail())
                                        .role(user.getRole())
                                        .twoFactorRequired(true)
                                        .build();
                }

                user.setLastLogin(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());

                userPort.save(user);

                String token = authenticationTokenPort.generate(user);

                log(
                                user,
                                "LOGIN",
                                true,
                                "Inicio de sesión exitoso");

                return AuthResult.builder()
                                .token(token)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .twoFactorRequired(false)
                                .build();
        }

        // =========================================================
        // LOGIN 2FA
        // =========================================================

        @Override
        public AuthResult loginWithTwoFactor(
                        String tempToken,
                        String code) {

                Long userId = authenticationTokenPort
                                .validate(tempToken)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Token temporal inválido"));

                User user = userPort.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Usuario no encontrado"));

                if (!twoFactorService.isEnabled(user)
                                || !twoFactorAuthenticationPort.verifyCode(
                                                user.getTotpSecret(),
                                                code)) {

                        log(
                                        user,
                                        "LOGIN_2FA",
                                        false,
                                        "Código 2FA inválido");

                        throw new IllegalArgumentException(
                                        "Código 2FA inválido");
                }

                user.setLastLogin(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());

                userPort.save(user);

                String token = authenticationTokenPort.generate(user);

                log(
                                user,
                                "LOGIN_2FA",
                                true,
                                "Inicio de sesión exitoso con 2FA");

                return AuthResult.builder()
                                .token(token)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .twoFactorRequired(false)
                                .build();
        }

        // =========================================================
        // REGISTRO
        // =========================================================

        @Override
        public void register(RegisterCommand command) {

                if (command == null) {
                        throw new IllegalArgumentException(
                                        "Los datos de registro son obligatorios");
                }

                String email = normalizeEmail(command.getEmail());

                if (userPort.existsByEmail(email)) {

                        throw new IllegalArgumentException(
                                        "El correo ya está registrado");
                }

                if (command.getRole() == null) {

                        throw new IllegalArgumentException(
                                        "El rol es obligatorio");
                }

                /*
                 * El frontend debe enviar:
                 *
                 * BUYER
                 * PRODUCER
                 * ADMIN
                 *
                 * No:
                 *
                 * COMPRADOR
                 * PRODUCTOR
                 */
                if (command.getRole() == Role.ADMIN) {

                        throw new IllegalArgumentException(
                                        "No se permite registrar administradores");
                }

                passwordPolicyService.validate(
                                command.getPassword());

                LocalDateTime now = LocalDateTime.now();

                String verificationToken = UUID.randomUUID().toString();

                User user = User.builder()
                                .firstName(command.getFirstName())
                                .lastName(command.getLastName())
                                .email(email)
                                .password(
                                                passwordHashPort.hash(
                                                                command.getPassword()))
                                .phone(command.getPhone())
                                .role(command.getRole())
                                .countryCode(command.getCountryCode())
                                .location(command.getLocation())
                                .idNumber(command.getIdNumber())
                                .birthDate(command.getBirthDate())
                                .idType(command.getIdType())
                                .companyName(command.getCompanyName())
                                .nit(command.getNit())
                                .isCompany(
                                                command.getIsCompany() == null
                                                                ? false
                                                                : command.getIsCompany())
                                .active(true)
                                .approved(true)
                                .emailVerified(false)
                                .provider("local")
                                .accountStatus("PENDING_EMAIL")
                                .accountApproved(false)
                                .accountComplete(false)
                                .registrationDate(now)
                                .createdAt(now)
                                .updatedAt(now)
                                .emailVerificationToken(
                                                verificationToken)
                                .emailTokenExpiry(
                                                now.plusHours(24))
                                .build();

                User saved = userPort.save(user);

                /*
                 * El usuario ya fue guardado.
                 * Ahora se envía el correo mediante EmailPort.
                 *
                 * EmailPort será implementado por BrevoEmailAdapter.
                 */
                emailPort.sendVerificationEmail(
                                saved.getEmail(),
                                saved.getEmailVerificationToken());
        }

        // =========================================================
        // REENVIAR VERIFICACIÓN
        // =========================================================

        @Override
        public void reenviarVerificacion(
                        String email) {

                String normalizedEmail = normalizeEmail(email);

                User user = userPort.findByEmail(normalizedEmail)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe una cuenta registrada con ese correo"));

                if (user.isEmailVerified()) {

                        throw new IllegalArgumentException(
                                        "El correo electrónico ya está verificado");
                }

                String verificationToken = UUID.randomUUID().toString();

                user.setEmailVerificationToken(
                                verificationToken);

                user.setEmailTokenExpiry(
                                LocalDateTime.now()
                                                .plusHours(24));

                user.setUpdatedAt(
                                LocalDateTime.now());

                userPort.save(user);

                emailPort.sendVerificationEmail(
                                user.getEmail(),
                                verificationToken);
        }

        // =========================================================
        // RECUPERACIÓN DE CONTRASEÑA
        // =========================================================

        @Override
        public void solicitarRecuperacionContrasena(
                        String email) {

                String normalizedEmail = normalizeEmail(email);

                User user = userPort.findByEmail(normalizedEmail)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe una cuenta registrada con ese correo"));

                SecureRandom secureRandom = new SecureRandom();

                String resetToken = String.format(
                                "%06d",
                                secureRandom.nextInt(1_000_000));

                LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

                user.setPasswordResetToken(resetToken);

                user.setPasswordResetTokenExpiry(expiry);

                user.setUpdatedAt(LocalDateTime.now());

                userPort.save(user);

                emailPort.sendPasswordResetEmail(
                                user.getEmail(),
                                resetToken);
        }
        // =========================================================
        // VERIFICAR RECUPERACIÓN
        // =========================================================

        @Override
        public void verificarRecuperacionContrasena(
                        String email,
                        String token) {

                User user = findUserByEmail(email);

                validatePasswordResetToken(
                                user,
                                token);
        }

        // =========================================================
        // RESTABLECER CONTRASEÑA
        // =========================================================

        @Override
        public void restablecerContrasena(
                        String email,
                        String token,
                        String newPassword) {

                User user = findUserByEmail(email);

                validatePasswordResetToken(
                                user,
                                token);

                if (newPassword == null
                                || newPassword.isBlank()) {

                        throw new IllegalArgumentException(
                                        "La nueva contraseña es obligatoria");
                }

                passwordPolicyService.validate(
                                newPassword);

                /*
                 * Nunca se almacena la contraseña
                 * en texto plano.
                 */
                user.setPassword(
                                passwordHashPort.hash(
                                                newPassword));

                /*
                 * El token se invalida inmediatamente
                 * después de utilizarse.
                 */
                user.setPasswordResetToken(null);
                user.setPasswordResetTokenExpiry(null);

                user.setUpdatedAt(
                                LocalDateTime.now());

                userPort.save(user);

                log(
                                user,
                                "PASSWORD_RESET",
                                true,
                                "Contraseña restablecida correctamente");
        }

        // =========================================================
        // GOOGLE OAUTH2
        // =========================================================

        // =========================================================
        // GOOGLE OAUTH2
        // =========================================================

        @Override
        @Transactional(readOnly = true)
        public String startGoogleOAuth2() {
                return googleOAuth2Port.buildAuthorizationUrl();
        }

        @Override
        public AuthResult completeGoogleOAuth2(
                        String code,
                        String requestedRole) {

                if (code == null || code.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El código de Google es obligatorio");
                }

                if (requestedRole == null || requestedRole.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El rol solicitado es obligatorio");
                }

                GoogleOAuth2Port.GoogleUserInfo info = googleOAuth2Port.exchangeCodeForUserInfo(code);

                if (info == null
                                || info.getEmail() == null
                                || info.getEmail().isBlank()) {

                        throw new IllegalArgumentException(
                                        "Google no devolvió un correo electrónico válido");
                }

                String email = normalizeEmail(info.getEmail());

                Role role;

                try {
                        role = Role.valueOf(
                                        requestedRole.trim().toUpperCase());

                } catch (IllegalArgumentException e) {

                        throw new IllegalArgumentException(
                                        "Rol de Google inválido. " +
                                                        "Valores permitidos: BUYER o PRODUCER");
                }

                if (role == Role.ADMIN) {
                        throw new IllegalArgumentException(
                                        "No se permite registrar administradores mediante Google");
                }

                User user = userPort
                                .findByEmail(email)
                                .orElse(null);

                if (user == null) {

                        user = User.builder()
                                        .firstName(info.getFirstName())
                                        .email(email)
                                        .role(role)
                                        .active(true)
                                        .approved(true)
                                        .emailVerified(true)
                                        .provider("google")
                                        .providerId(info.getGoogleId())
                                        .photoUrl(info.getPicture())
                                        .accountApproved(true)
                                        .accountComplete(false)
                                        .accountStatus("ACTIVE")
                                        .registrationDate(LocalDateTime.now())
                                        .createdAt(LocalDateTime.now())
                                        .updatedAt(LocalDateTime.now())
                                        .build();

                } else {

                        user.setProvider("google");
                        user.setProviderId(info.getGoogleId());
                        user.setPhotoUrl(info.getPicture());
                        user.setEmailVerified(true);
                        user.setAccountStatus("ACTIVE");
                        user.setUpdatedAt(LocalDateTime.now());
                }

                User savedUser = userPort.save(user);

                String token = authenticationTokenPort.generate(savedUser);

                log(
                                savedUser,
                                "GOOGLE_LOGIN",
                                true,
                                "Autenticación mediante Google");

                return AuthResult.builder()
                                .token(token)
                                .userId(savedUser.getId())
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole())
                                .twoFactorRequired(false)
                                .build();
        }
        // =========================================================
        // 2FA - CONFIGURACIÓN
        // =========================================================

        @Override
        public TwoFactorSetupResult initTwoFactorSetup(
                        Long userId) {

                User user = findUser(userId);

                if (!twoFactorService.canEnable(user)) {

                        throw new IllegalArgumentException(
                                        "El usuario no puede habilitar 2FA");
                }

                String secret = twoFactorAuthenticationPort
                                .generateSecret();

                String uri = twoFactorAuthenticationPort
                                .generateQrCodeUri(
                                                user.getEmail(),
                                                secret);

                user.setTotpSecret(secret);
                user.setUpdatedAt(
                                LocalDateTime.now());

                userPort.save(user);

                return TwoFactorSetupResult.builder()
                                .userId(user.getId())
                                .secret(secret)
                                .qrCodeUri(uri)
                                .build();
        }

        // =========================================================
        // 2FA - CONFIRMAR
        // =========================================================

        @Override
        public void confirmTwoFactorSetup(
                        Long userId,
                        String code) {

                User user = findUser(userId);

                if (!twoFactorService.canEnable(user)
                                || user.getTotpSecret() == null
                                || !twoFactorAuthenticationPort
                                                .verifyCode(
                                                                user.getTotpSecret(),
                                                                code)) {

                        throw new IllegalArgumentException(
                                        "No fue posible confirmar 2FA");
                }

                user.setTotpEnabled(true);
                user.setUpdatedAt(
                                LocalDateTime.now());

                userPort.save(user);

                log(
                                user,
                                "2FA_ENABLED",
                                true,
                                "Autenticación de dos factores habilitada");
        }

        // =========================================================
        // 2FA - DESHABILITAR
        // =========================================================

        @Override
        public void disableTwoFactor(
                        Long userId,
                        String code) {

                User user = findUser(userId);

                if (!twoFactorService.isEnabled(user)
                                || user.getTotpSecret() == null
                                || !twoFactorAuthenticationPort
                                                .verifyCode(
                                                                user.getTotpSecret(),
                                                                code)) {

                        throw new IllegalArgumentException(
                                        "Código 2FA inválido");
                }

                user.setTotpEnabled(false);
                user.setTotpSecret(null);
                user.setUpdatedAt(
                                LocalDateTime.now());

                userPort.save(user);

                log(
                                user,
                                "2FA_DISABLED",
                                true,
                                "Autenticación de dos factores deshabilitada");
        }

        // =========================================================
        // 2FA - ESTADO
        // =========================================================

        @Override
        @Transactional(readOnly = true)
        public boolean isTwoFactorEnabled(
                        Long userId) {

                return twoFactorService
                                .isEnabled(
                                                findUser(userId));
        }

        // =========================================================
        // MÉTODOS AUXILIARES
        // =========================================================

        private User findUser(Long id) {

                if (id == null) {

                        throw new IllegalArgumentException(
                                        "El ID del usuario es obligatorio");
                }

                return userPort.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Usuario no encontrado"));
        }

        private User findUserByEmail(
                        String email) {

                String normalizedEmail = normalizeEmail(email);

                return userPort.findByEmail(
                                normalizedEmail)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "No existe una cuenta registrada con ese correo"));
        }

        private void validatePasswordResetToken(
                        User user,
                        String token) {

                if (token == null
                                || token.isBlank()) {

                        throw new IllegalArgumentException(
                                        "El código de recuperación es obligatorio");
                }

                if (user.getPasswordResetToken() == null
                                || user.getPasswordResetTokenExpiry() == null) {

                        throw new IllegalArgumentException(
                                        "No existe un código de recuperación activo");
                }

                if (user.getPasswordResetTokenExpiry()
                                .isBefore(LocalDateTime.now())) {

                        throw new IllegalArgumentException(
                                        "El código de recuperación ha expirado");
                }

                if (!user.getPasswordResetToken()
                                .equals(token.trim())) {

                        throw new IllegalArgumentException(
                                        "El código de recuperación no es válido");
                }
        }

        private String normalizeEmail(
                        String email) {

                if (email == null
                                || email.isBlank()) {

                        throw new IllegalArgumentException(
                                        "El correo electrónico es obligatorio");
                }

                return email
                                .trim()
                                .toLowerCase();
        }

        private void log(
                        User user,
                        String action,
                        boolean success,
                        String details) {

                authEventPort.logAuthEvent(
                                AuthAccessEvent.builder()
                                                .userId(user.getId())
                                                .email(user.getEmail())
                                                .role(user.getRole())
                                                .action(action)
                                                .success(success)
                                                .details(details)
                                                .build());
        }
}