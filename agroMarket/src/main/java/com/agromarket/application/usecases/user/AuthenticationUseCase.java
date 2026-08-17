package com.agromarket.application.usecases.user;

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
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.domain.ports.out.user.TwoFactorAuthenticationPort;
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

    @Override
    public AuthResult login(LoginCommand command) {
        User user = userPort.findByEmail(command.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!userService.canLogin(user)
                || !passwordHashPort.matches(command.getPassword(), user.getPassword())) {
            log(user, "LOGIN", false, "Credenciales inválidas");
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        if (twoFactorService.isEnabled(user)) {
            String temporaryToken = authenticationTokenPort.generateTemporary(user);
            log(user, "LOGIN_2FA_REQUIRED", true, "Segundo factor requerido");
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
        log(user, "LOGIN", true, "Inicio de sesión exitoso");

        return AuthResult.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFactorRequired(false)
                .build();
    }

    @Override
    public AuthResult loginWithTwoFactor(String tempToken, String code) {
        Long userId = authenticationTokenPort.validate(tempToken)
                .orElseThrow(() -> new IllegalArgumentException("Token temporal inválido"));

        User user = userPort.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!twoFactorService.isEnabled(user)
                || !twoFactorAuthenticationPort.verifyCode(user.getTotpSecret(), code)) {
            log(user, "LOGIN_2FA", false, "Código 2FA inválido");
            throw new IllegalArgumentException("Código 2FA inválido");
        }

        user.setLastLogin(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);

        String token = authenticationTokenPort.generate(user);
        log(user, "LOGIN_2FA", true, "Inicio de sesión exitoso con 2FA");

        return AuthResult.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFactorRequired(false)
                .build();
    }

    @Override
    public void register(RegisterCommand command) {
        String email = command.getEmail().trim().toLowerCase();
        if (userPort.existsByEmail(email)) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        passwordPolicyService.validate(command.getPassword());

        User user = User.builder()
                .firstName(command.getFirstName())
                .lastName(command.getLastName())
                .email(email)
                .password(passwordHashPort.hash(command.getPassword()))
                .phone(command.getPhone())
                .role(command.getRole())
                .countryCode(command.getCountryCode())
                .location(command.getLocation())
                .idNumber(command.getIdNumber())
                .birthDate(command.getBirthDate())
                .idType(command.getIdType())
                .companyName(command.getCompanyName())
                .nit(command.getNit())
                .isCompany(command.getIsCompany() == null ? false : command.getIsCompany())
                .active(true)
                .approved(true)
                .emailVerified(false)
                .provider("local")
                .accountStatus("PENDING_EMAIL")
                .accountApproved(false)
                .registrationDate(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .emailVerificationToken(UUID.randomUUID().toString())
                .emailTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        User saved = userPort.save(user);
        emailPort.sendVerificationEmail(saved.getEmail(), saved.getEmailVerificationToken());
    }

    @Override
    @Transactional(readOnly = true)
    public String startGoogleOAuth2() {
        return googleOAuth2Port.buildAuthorizationUrl();
    }

    @Override
    public AuthResult completeGoogleOAuth2(String code, String requestedRole) {
        GoogleOAuth2Port.GoogleUserInfo info = googleOAuth2Port.exchangeCodeForUserInfo(code);
        String email = info.getEmail().trim().toLowerCase();

        Role role = Role.valueOf(requestedRole.toUpperCase());
        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("No se permite registrar administradores mediante Google");
        }
        User user = userPort.findByEmail(email).orElseGet(() -> User.builder()
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
                .build());

        user.setProvider("google");
        user.setProviderId(info.getGoogleId());
        user.setPhotoUrl(info.getPicture());
        user.setEmailVerified(true);
        user.setAccountStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userPort.save(user);
        String token = authenticationTokenPort.generate(saved);
        log(saved, "GOOGLE_LOGIN", true, "Autenticación mediante Google");

        return AuthResult.builder()
                .token(token)
                .userId(saved.getId())
                .email(saved.getEmail())
                .role(saved.getRole())
                .build();
    }

    @Override
    public TwoFactorSetupResult initTwoFactorSetup(Long userId) {
        User user = findUser(userId);
        if (!twoFactorService.canEnable(user)) {
            throw new IllegalArgumentException("El usuario no puede habilitar 2FA");
        }

        String secret = twoFactorAuthenticationPort.generateSecret();
        String uri = twoFactorAuthenticationPort.generateQrCodeUri(user.getEmail(), secret);

        user.setTotpSecret(secret);
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);

        return TwoFactorSetupResult.builder()
                .userId(user.getId())
                .secret(secret)
                .qrCodeUri(uri)
                .build();
    }

    @Override
    public void confirmTwoFactorSetup(Long userId, String code) {
        User user = findUser(userId);

        if (!twoFactorService.canEnable(user)
                || user.getTotpSecret() == null
                || !twoFactorAuthenticationPort.verifyCode(user.getTotpSecret(), code)) {
            throw new IllegalArgumentException("No fue posible confirmar 2FA");
        }

        user.setTotpEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);
    }

    @Override
    public void disableTwoFactor(Long userId, String code) {
        User user = findUser(userId);

        if (!twoFactorService.isEnabled(user)
                || !twoFactorAuthenticationPort.verifyCode(user.getTotpSecret(), code)) {
            throw new IllegalArgumentException("Código 2FA inválido");
        }

        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        user.setUpdatedAt(LocalDateTime.now());
        userPort.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isTwoFactorEnabled(Long userId) {
        return twoFactorService.isEnabled(findUser(userId));
    }

    private User findUser(Long id) {
        return userPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    private void log(User user, String action, boolean success, String details) {
        authEventPort.logAuthEvent(AuthAccessEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .action(action)
                .success(success)
                .details(details)
                .build());
    }

}
