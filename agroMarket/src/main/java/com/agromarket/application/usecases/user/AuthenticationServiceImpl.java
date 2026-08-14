package com.agromarket.application.usecases.user;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.dto.request.user.LoginRequest;
import com.agromarket.application.dto.request.user.RegisterRequest;
import com.agromarket.application.dto.response.user.AuthResponse;
import com.agromarket.application.dto.response.user.TwoFactorSetupResponse;
import com.agromarket.application.mappers.UserMapper;
import com.agromarket.domain.user.enums.Role;
import com.agromarket.domain.user.exceptions.InvalidCredentialsException;
import com.agromarket.domain.user.exceptions.TooManyRequestsException;
import com.agromarket.domain.user.exceptions.UserAlreadyExistsException;
import com.agromarket.domain.user.model.User;
import com.agromarket.domain.user.ports.in.AuthenticationService;
import com.agromarket.domain.user.ports.out.AuthEventRepository;
import com.agromarket.domain.user.ports.out.UserRepository;
import com.agromarket.infrastructure.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de autenticación que gestiona el registro, login,
 * autenticación con proveedores externos y autenticación de dos factores.
 * 
 * <p>Este servicio centraliza toda la lógica de autenticación del sistema,
 * incluyendo validación de credenciales, generación de tokens JWT,
 * gestión de sesiones y protección contra ataques de fuerza bruta.</p>
 * 
 * @author AgroMarket Team
 */
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final AuthEventRepository authEventRepository;
    
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;
    
    @Override
    public AuthResponse login(LoginRequest request) {
        // Validar intentos de login recientes
        Instant oneHourAgo = Instant.now().minusSeconds(3600);
        var failedAttempts = authEventRepository.getFailedLoginAttempts(request.getEmail(), oneHourAgo);
        
        if (failedAttempts.size() >= MAX_LOGIN_ATTEMPTS) {
            throw new TooManyRequestsException(
                "Demasiados intentos de inicio de sesión. Por favor intente de nuevo en " + 
                LOCKOUT_DURATION_MINUTES + " minutos.");
        }
        
        // Buscar usuario por email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Credenciales inválidas. Por favor verifique su correo y contraseña."));
        
        // Validar contraseña
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Registrar intento fallido
            authEventRepository.logAuthEvent(
                user.getId(), user.getEmail(), user.getRole(), "LOGIN",
                false, null, null, null, "Invalid password", Instant.now().plusSeconds(86400));
            
            throw new InvalidCredentialsException("Credenciales inválidas. Por favor verifique su correo y contraseña.");
        }
        
        // Validar que el usuario esté activo
        if (!user.isActive()) {
            throw new InvalidCredentialsException("Su cuenta ha sido deshabilitada. Por favor contacte al administrador.");
        }
        
        // Verificar si 2FA está habilitado
        if (user.isTotpEnabled()) {
            // Generar token temporal para 2FA
            String tempToken = UUID.randomUUID().toString();
            
            // Guardar intento de login pendiente de 2FA
            authEventRepository.logAuthEvent(
                user.getId(), user.getEmail(), user.getRole(), "LOGIN_2FA_PENDING",
                true, tempToken, null, null, "Pending 2FA verification", Instant.now().plusSeconds(300));
            
            return AuthResponse.builder()
                    .twoFactorRequired(true)
                    .tempToken(tempToken)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .build();
        }
        
        // Login exitoso
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        
        // Registrar evento de login exitoso
        authEventRepository.logAuthEvent(
            user.getId(), user.getEmail(), user.getRole(), "LOGIN",
            true, null, null, null, "Successful login", Instant.now().plusSeconds(86400));
        
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFactorRequired(false)
                .pendingApproval(!user.isAccountApproved())
                .accountComplete(user.isAccountComplete())
                .photoUrl(user.getPhotoUrl())
                .lastName(user.getLastName())
                .build();
    }
    
    @Override
    public AuthResponse loginWithTwoFactor(String tempToken, String code) {
        // Validar código 2FA (implementación simplificada - en producción usar librería TOTP)
        // Buscar evento pendiente de 2FA
        var events = authEventRepository.getEventsByEmail(null); // Simplificación - en producción buscar por tempToken
        
        // Esto es un placeholder - la implementación completa requeriría:
        // 1. Buscar el usuario por tempToken
        // 2. Validar el código TOTP
        // 3. Generar token JWT
        
        throw new UnsupportedOperationException("Implementación de 2FA pendiente");
    }
    
    @Override
    @Transactional
    public void register(RegisterRequest request) {
        // Validar que el email no exista
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Ya existe un usuario registrado con este correo electrónico.");
        }
        
        // Validar que la contraseña y confirmación coincidan
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden.");
        }
        
        // Mapear request a User
        User user = userMapper.fromRegisterRequest(request);
        
        // Hash de la contraseña
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Configurar valores por defecto
        user.setActive(true);
        user.setApproved(false);
        user.setEmailVerified(false);
        user.setRegistrationDate(LocalDateTime.now());
        user.setAccountStatus("PENDING_EMAIL");
        
        // Guardar usuario
        userRepository.save(user);
        
        // Registrar evento de registro
        authEventRepository.logAuthEvent(
            user.getId(), user.getEmail(), user.getRole(), "REGISTER",
            true, null, null, null, "User registered successfully", Instant.now().plusSeconds(86400));
    }
    
    @Override
    public String startGoogleOAuth2() {
        // Implementación simplificada - en producción integrar con Spring Security OAuth2
        return "/oauth2/authorization/google";
    }
    
    @Override
    @Transactional
    public AuthResponse completeGoogleOAuth2(String email, String firstName, String picture, 
                                              String requestedRole, String googleId) {
        // Buscar o crear usuario
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .firstName(firstName)
                            .provider("google")
                            .providerId(googleId)
                            .photoUrl(picture)
                            .role(Role.valueOf(requestedRole.toUpperCase()))
                            .password("google-auth-" + UUID.randomUUID()) // Contraseña dummy
                            .active(true)
                            .emailVerified(true)
                            .registrationDate(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });
        
        // Generar token
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .email(user.getEmail())
                .role(user.getRole())
                .twoFactorRequired(false)
                .accountComplete(user.isAccountComplete())
                .photoUrl(user.getPhotoUrl())
                .lastName(user.getLastName())
                .build();
    }
    
    @Override
    public TwoFactorSetupResponse initTwoFactorSetup(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Usuario no encontrado."));
        
        // Generar secreto TOTP (simplificado - en producción usar librería)
        String secret = "JBSWY3DPEHPK3PXP"; // Esto debería ser generado con una librería TOTP
        
        user.setTotpSecret(secret);
        userRepository.save(user);
        
        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl("https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/AgroMarket:"
                        + user.getEmail() + "?secret=" + secret + "&issuer=AgroMarket")
                .build();
    }
    
    @Override
    public void confirmTwoFactorSetup(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Usuario no encontrado."));
        
        // Validar código TOTP (simplificado)
        // En producción: usar librería como Google Authenticator
        
        user.setTotpEnabled(true);
        userRepository.save(user);
    }
    
    @Override
    public void disableTwoFactor(Long userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Usuario no encontrado."));
        
        // Validar código TOTP antes de deshabilitar
        // Simplificado - en producción validar código
        
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        userRepository.save(user);
    }
    
    @Override
    public boolean isTwoFactorEnabled(Long userId) {
        return userRepository.findById(userId)
                .map(User::isTotpEnabled)
                .orElse(false);
    }
    
    @Override
    public void verifyEmail(String token) {
        // Implementación simplificada - en producción buscar token en la base de datos
        // y marcar el email como verificado
        throw new UnsupportedOperationException("Verificación de email pendiente de implementación completa");
    }
}
