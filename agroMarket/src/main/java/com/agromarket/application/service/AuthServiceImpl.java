package com.agromarket.application.service;

import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.UsuarioYaExisteException;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.application.dto.TwoFactorSetupResponse;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.AdministradorEntity;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtTokenProvider;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"null", "unused"})
public class AuthServiceImpl implements AuthService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.agromarket.application.service.EmailVerificationService emailVerificationService;
    private final PasswordPolicyService passwordPolicyService;
    private final TwoFactorAuthenticatorService twoFactorAuthenticatorService;
    private final com.agromarket.infrastructure.validation.DeepEmailValidatorService deepEmailValidatorService;

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(request.getCorreo())
                    .orElseThrow(() -> {
                        log.warn("Intento de login fallido - correo={} ip={} timestamp={}", obfuscateEmail(request.getCorreo()), getRemoteIp(), Instant.now().toEpochMilli());
                        return new CredencialesInvalidasException("Correo o contraseña incorrectos");
                    });
            if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
                log.warn("Intento de login fallido - correo={} ip={} timestamp={}", obfuscateEmail(request.getCorreo()), getRemoteIp(), Instant.now().toEpochMilli());
                throw new CredencialesInvalidasException("Correo o contraseña incorrectos");
            }
            if (!usuario.isActivo()) {
                // User exists but hasn't verified email
                log.warn("Intento de login de usuario no verificado - correo={} ip={} timestamp={}", obfuscateEmail(usuario.getCorreo()), getRemoteIp(), Instant.now().toEpochMilli());
                throw new com.agromarket.domain.exception.AccesoDenegadoException("Debes verificar tu correo");
            }
            if (usuario.getRol() == RolUsuario.PRODUCTOR && !usuario.isAprobado()) {
                throw new com.agromarket.domain.exception.AccesoDenegadoException("Tu cuenta de productor está pendiente de aprobación por un administrador");
            }
            if (usuario.isTotpEnabled()) {
                String tempToken = jwtTokenProvider.generateTwoFactorToken(usuario.getCorreo(), usuario.getId(), usuario.getRol());
                return AuthResponse.builder()
                        .tipo("Bearer")
                        .userId(usuario.getId())
                        .nombre(usuario.getNombre())
                        .correo(usuario.getCorreo())
                        .rol(usuario.getRol())
                        .twoFactorRequired(true)
                        .tempToken(tempToken)
                        .build();
            }
            String token = jwtTokenProvider.generateToken(usuario.getCorreo(), usuario.getId(), usuario.getRol());
            return AuthResponse.builder()
                    .token(token)
                    .tipo("Bearer")
                    .userId(usuario.getId())
                    .nombre(usuario.getNombre())
                    .correo(usuario.getCorreo())
                    .rol(usuario.getRol())
                    .build();
        } catch (CredencialesInvalidasException | com.agromarket.domain.exception.AccesoDenegadoException ex) {
            // already logged above when appropriate
            throw ex;
        } catch (Exception ex) {
            log.warn("Error no esperado en login - correo={} ip={} timestamp={} reason={}", obfuscateEmail(request.getCorreo()), getRemoteIp(), Instant.now().toEpochMilli(), ex.getMessage());
            throw ex;
        }
    }

    @Override
    public AuthResponse loginWithTwoFactor(String tempToken, String codigo) {
        if (!jwtTokenProvider.validateToken(tempToken) || !jwtTokenProvider.isTwoFactorToken(tempToken)) {
            throw new CredencialesInvalidasException("Sesión de verificación en dos pasos inválida o expirada");
        }

        Long userId = jwtTokenProvider.extractUserId(tempToken);
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (!usuario.isTotpEnabled() || usuario.getTotpSecret() == null || usuario.getTotpSecret().isBlank()) {
            throw new CredencialesInvalidasException("La autenticación en dos pasos no está configurada");
        }

        boolean valido = twoFactorAuthenticatorService.verifyCode(usuario.getTotpSecret(), codigo);
        if (!valido) {
            throw new CredencialesInvalidasException("Código de autenticación inválido");
        }

        String token = jwtTokenProvider.generateToken(usuario.getCorreo(), usuario.getId(), usuario.getRol());
        return buildAuthenticatedResponse(usuario, token);
    }

    @Override
    @Transactional
    public TwoFactorSetupResponse initTwoFactorSetup(Long userId) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        String secret = twoFactorAuthenticatorService.generateSecret();
        usuario.setTotpSecret(secret);
        usuario.setTotpEnabled(false);
        usuarioJpaRepository.save(usuario);

        String issuer = "AgroMarket";
        return TwoFactorSetupResponse.builder()
                .enabled(false)
                .secret(secret)
                .issuer(issuer)
                .accountName(usuario.getCorreo())
                .otpauthUrl(twoFactorAuthenticatorService.buildOtpAuthUrl(issuer, usuario.getCorreo(), secret))
                .build();
    }

    @Override
    @Transactional
    public void confirmTwoFactorSetup(Long userId, String codigo) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (usuario.getTotpSecret() == null || usuario.getTotpSecret().isBlank()) {
            throw new CredencialesInvalidasException("Primero debes iniciar la configuración de Authenticator");
        }

        boolean valido = twoFactorAuthenticatorService.verifyCode(usuario.getTotpSecret(), codigo);
        if (!valido) {
            throw new CredencialesInvalidasException("Código de autenticación inválido");
        }

        usuario.setTotpEnabled(true);
        usuarioJpaRepository.save(usuario);
    }

    @Override
    @Transactional
    public void disableTwoFactor(Long userId, String codigo) {
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (!usuario.isTotpEnabled() || usuario.getTotpSecret() == null || usuario.getTotpSecret().isBlank()) {
            return;
        }

        boolean valido = twoFactorAuthenticatorService.verifyCode(usuario.getTotpSecret(), codigo);
        if (!valido) {
            throw new CredencialesInvalidasException("Código de autenticación inválido");
        }

        usuario.setTotpEnabled(false);
        usuario.setTotpSecret(null);
        usuarioJpaRepository.save(usuario);
    }

    @Override
    public boolean isTwoFactorEnabled(Long userId) {
        return usuarioJpaRepository.findById(userId)
                .map(UsuarioEntity::isTotpEnabled)
                .orElse(false);
    }

    private AuthResponse buildAuthenticatedResponse(UsuarioEntity usuario, String token) {
        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .userId(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .twoFactorRequired(false)
                .tempToken(null)
                .build();
    }

    @Override
    @Transactional
    public void registro(RegistroRequest request) {
        if (!deepEmailValidatorService.isEmailValid(request.getCorreo())) {
            throw new CredencialesInvalidasException("El correo electrónico no existe o no puede recibir mensajes.");
        }
        
        if (usuarioJpaRepository.existsByCorreo(request.getCorreo())) {
            throw new UsuarioYaExisteException("Ya existe un usuario con ese correo");
        }
        passwordPolicyService.validarContrasenaRegistro(request.getContrasena());
        UsuarioEntity usuario = crearEntidad(request);
        // Producers require admin approval after email verification
        if (request.getRol() == RolUsuario.PRODUCTOR) {
            usuario.setAprobado(false);
        } else {
            usuario.setAprobado(true);
        }
        usuario.setNombre(compactarNombre(request.getNombre(), request.getApellido()));
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setTelefono(request.getTelefono());
        // Require email verification before activating the account
        usuario.setActivo(false);
        usuario.setFechaRegistro(LocalDateTime.now());
        UsuarioEntity guardado = usuarioJpaRepository.save(usuario);
        passwordPolicyService.registrarContrasenaEnHistorial(guardado);
        // send verification email
        emailVerificationService.sendVerificationEmail(guardado);
    }

    @Override
    public String iniciarGoogleOAuth2() {
        return "/oauth2/authorization/google";
    }

    @Override
    @Transactional
    public AuthResponse completarGoogleOAuth2(String email, String nombre, String picture, String rolSolicitado, String googleId) {
        UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(email)
            .map(existingUser -> {
                existingUser.setNombre(nombre);
                existingUser.setGoogleId(googleId);
                existingUser.setProveedor("GOOGLE");
                if (picture != null && !picture.isEmpty()) existingUser.setFoto(picture);
                if (existingUser.getRol() != RolUsuario.PRODUCTOR) {
                    existingUser.setActivo(true); // Ensure user is active after OAuth2 login, unless pending producer
                }
                return existingUser;
            })
            .orElseGet(() -> {
                RolUsuario rol = "PRODUCTOR".equalsIgnoreCase(rolSolicitado) ? RolUsuario.PRODUCTOR : RolUsuario.COMPRADOR;
                UsuarioEntity nuevo;
                if (rol == RolUsuario.PRODUCTOR) {
                    ProductorEntity p = new ProductorEntity();
                    p.setUbicacion("Pendiente de definir");
                    nuevo = p;
                } else {
                    nuevo = new CompradorEntity();
                }

                nuevo.setRol(rol);
                nuevo.setCorreo(email);
                nuevo.setNombre(nombre);
                nuevo.setFoto(picture);
                nuevo.setTelefono("0000000000"); // Default phone
                nuevo.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for OAuth2 users
                
                if (rol == RolUsuario.PRODUCTOR) {
                    nuevo.setActivo(true);
                    nuevo.setAprobado(false); // Espera aprobación
                } else {
                    nuevo.setActivo(true);
                    nuevo.setAprobado(true);
                }
                
                nuevo.setFechaRegistro(LocalDateTime.now());
                nuevo.setProveedor("GOOGLE"); // Set provider
                nuevo.setGoogleId(googleId);
                nuevo.setEmailVerificado(true); // Email is verified by Google
                return nuevo;
            });

        usuario = usuarioJpaRepository.save(usuario);

        if (usuario.getRol() == RolUsuario.PRODUCTOR && !usuario.isAprobado()) {
            return AuthResponse.builder()
                    .tipo("Bearer")
                    .userId(usuario.getId())
                    .nombre(usuario.getNombre())
                    .correo(usuario.getCorreo())
                    .rol(usuario.getRol())
                    .pendienteAprobacion(true)
                    .build();
        }

        String token = jwtTokenProvider.generateToken(usuario.getCorreo(), usuario.getId(), usuario.getRol());
        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .userId(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .pendienteAprobacion(false)
                .build();
    }


    private String getRemoteIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                if (req != null) return req.getRemoteAddr();
            }
        } catch (Exception e) {
            // ignore
        }
        return "unknown";
    }

    private String obfuscateEmail(String correo) {
        if (correo == null || correo.isBlank()) return "";
        int at = correo.indexOf('@');
        if (at <= 1) return "***@" + correo.substring(at + 1);
        String local = correo.substring(0, at);
        String domain = correo.substring(at + 1);
        String visible = local.substring(0, 1);
        return visible + "***@" + domain;
    }

    private UsuarioEntity crearEntidad(RegistroRequest request) {
        if (request.getRol() == RolUsuario.PRODUCTOR) {
            if (request.getUbicacion() == null || request.getUbicacion().isBlank()) {
                throw new CredencialesInvalidasException("La ubicación es obligatoria para un productor");
            }
            ProductorEntity productor = ProductorEntity.builder().ubicacion(request.getUbicacion()).build();
            productor.setRol(RolUsuario.PRODUCTOR);
            return completarBase(productor, request);
        }
        if (request.getRol() == RolUsuario.COMPRADOR) {
            CompradorEntity comprador = CompradorEntity.builder().build();
            comprador.setRol(RolUsuario.COMPRADOR);
            return completarBase(comprador, request);
        }
        AdministradorEntity administrador = AdministradorEntity.builder().build();
        administrador.setRol(RolUsuario.ADMINISTRADOR);
        return completarBase(administrador, request);
    }

    private UsuarioEntity completarBase(UsuarioEntity usuario, RegistroRequest request) {
        usuario.setCorreo(request.getCorreo());
        usuario.setTelefono(request.getTelefono());
        return usuario;
    }

    private String compactarNombre(String nombre, String apellido) {
        if (apellido == null || apellido.isBlank()) {
            return nombre;
        }
        return nombre + " " + apellido.trim();
    }
}
