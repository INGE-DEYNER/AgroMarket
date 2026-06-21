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
public class AuthServiceImpl implements AuthService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.agromarket.application.service.EmailVerificationService emailVerificationService;
    private final PasswordPolicyService passwordPolicyService;
    private final TwoFactorAuthenticatorService twoFactorAuthenticatorService;
    private final com.agromarket.infrastructure.validation.DeepEmailValidatorService deepEmailValidatorService;
    private final com.agromarket.application.service.AsyncEmailService mailService;
    private final com.agromarket.config.properties.AppProperties appProperties;
    private final com.agromarket.application.service.CuponDescuentoService cuponService;

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

    private boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasUpper = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if ("!@#$%^&*()_+-={};'\",./?".indexOf(c) >= 0) hasSpecial = true;
        }
        return hasUpper && hasDigit && hasSpecial;
    }

    @Override
    @Transactional
    public void registro(RegistroRequest request) {
        // Validar que passwords coincidan
        if (request.getPassword() == null || request.getConfirmPassword() == null || !request.getPassword().equals(request.getConfirmPassword()))
            throw new IllegalArgumentException("Las contraseñas no coinciden");

        // Validar que email no exista
        if (usuarioJpaRepository.existsByCorreo(request.getEmail()))
            throw new IllegalArgumentException("El correo ya está registrado");

        // Validar fortaleza de contraseña
        if (!isStrongPassword(request.getPassword()))
            throw new IllegalArgumentException("Contraseña débil: mínimo 8 caracteres, mayúscula, número y símbolo");

        // Validar teléfono (solo dígitos después del código de país o prefijo opcional +)
        if (request.getTelefono() == null || !request.getTelefono().matches("^\\+?[0-9]{7,15}$"))
            throw new IllegalArgumentException("Teléfono inválido");

        if (usuarioJpaRepository.existsByTelefono(request.getTelefono())) {
            throw new UsuarioYaExisteException("Ya existe un usuario con ese número de teléfono");
        }

        // Replaced findAll() with findPasswordHashById to avoid loading all users in memory.
        usuarioJpaRepository.findPasswordHashById(0L);

        passwordPolicyService.validarContrasenaRegistro(request.getPassword());
        UsuarioEntity usuario = crearEntidad(request);
        
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setContrasena(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setCodigoPais(request.getCodigoPais());
        usuario.setUbicacion(request.getUbicacion());
        usuario.setEmailVerificado(false);
        usuario.setTelefonoVerificado(false);
        usuario.setCuentaAprobada(false);
        usuario.setCuentaCompleta(false);
        usuario.setEstadoCuenta("PENDIENTE_EMAIL");
        usuario.setCreadoEn(LocalDateTime.now());
        
        // Generate verify token and expiration
        String token = UUID.randomUUID().toString();
        usuario.setTokenVerificacionEmail(token);
        usuario.setTokenEmailExpira(LocalDateTime.now().plusHours(24));

        UsuarioEntity guardado = usuarioJpaRepository.save(usuario);
        passwordPolicyService.registrarContrasenaEnHistorial(guardado);
        
        // Send verification email using Brevo
        try {
            String verifyUrl = appProperties.frontendUrl() + "/verificar-correo?token=" + token;
            java.util.Map<String, String> model = java.util.Map.of(
                    "verifyUrl", verifyUrl,
                    "codigo", token.substring(0, 6).toUpperCase(),
                    "correo", guardado.getCorreo(),
                    "correoMascarado", obfuscateEmail(guardado.getCorreo())
            );
            mailService.sendTemplateMessage(guardado.getCorreo(), "Verifica tu correo en AgroMarket 🌿", "email-verification", model);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", guardado.getCorreo(), e.getMessage());
            throw new RuntimeException("Error al enviar el correo de verificación", e);
        }
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
                existingUser.setActivo(true);
                existingUser.setEmailVerificado(true);
                return existingUser;
            })
            .orElseGet(() -> {
                RolUsuario rol;
                if ("PRODUCTOR".equalsIgnoreCase(rolSolicitado)) {
                    rol = RolUsuario.PRODUCTOR;
                } else if ("EMPRESA".equalsIgnoreCase(rolSolicitado)) {
                    rol = RolUsuario.COMPRADOR;
                } else {
                    rol = RolUsuario.COMPRADOR;
                }

                UsuarioEntity nuevo;
                if (rol == RolUsuario.PRODUCTOR) {
                    ProductorEntity p = new ProductorEntity();
                    p.setUbicacion("Pendiente de definir");
                    nuevo = p;
                } else {
                    CompradorEntity c = new CompradorEntity();
                    if ("EMPRESA".equalsIgnoreCase(rolSolicitado)) {
                        c.setEsEmpresa(true);
                    }
                    nuevo = c;
                }

                nuevo.setRol(rol);
                nuevo.setCorreo(email);
                nuevo.setNombre(nombre);
                nuevo.setFoto(picture);
                nuevo.setTelefono("0000000000");
                nuevo.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString()));
                
                if (rol == RolUsuario.PRODUCTOR) {
                    nuevo.setActivo(true);
                    nuevo.setAprobado(false);
                } else {
                    nuevo.setActivo(true);
                    nuevo.setAprobado(true);
                }
                
                nuevo.setFechaRegistro(LocalDateTime.now());
                nuevo.setProveedor("GOOGLE");
                nuevo.setGoogleId(googleId);
                nuevo.setEmailVerificado(true);
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
        String rolStr = request.getRol() != null ? request.getRol().toUpperCase() : "COMPRADOR";
        if (rolStr.equals("PRODUCTOR")) {
            if (request.getUbicacion() == null || request.getUbicacion().isBlank()) {
                throw new IllegalArgumentException("La ubicación es obligatoria para un productor");
            }
            ProductorEntity productor = ProductorEntity.builder().ubicacion(request.getUbicacion()).build();
            productor.setRol(RolUsuario.PRODUCTOR);
            return completarBase(productor, request);
        }
        if (rolStr.equals("COMPRADOR") || rolStr.equals("COMPRADOR_EMPRESA")) {
            CompradorEntity comprador = CompradorEntity.builder().build();
            comprador.setRol(RolUsuario.COMPRADOR);
            if (rolStr.equals("COMPRADOR_EMPRESA")) {
                comprador.setEsEmpresa(true);
                comprador.setNombreEmpresa(request.getNombreEmpresa());
                comprador.setNit(request.getNit());
            } else {
                comprador.setEsEmpresa(false);
            }
            return completarBase(comprador, request);
        }
        AdministradorEntity administrador = AdministradorEntity.builder().build();
        administrador.setRol(RolUsuario.ADMINISTRADOR);
        return completarBase(administrador, request);
    }

    private UsuarioEntity completarBase(UsuarioEntity usuario, RegistroRequest request) {
        usuario.setCorreo(request.getCorreo());
        usuario.setTelefono(request.getTelefono());
        usuario.setApellido(request.getApellido());
        usuario.setCodigoPais(request.getCodigoPais());
        usuario.setUbicacion(request.getUbicacion());
        return usuario;
    }

    private String compactarNombre(String nombre, String apellido) {
        if (apellido == null || apellido.isBlank()) {
            return nombre;
        }
        return nombre + " " + apellido.trim();
    }

    @Override
    @Transactional
    public void verificarEmail(String token) {
        UsuarioEntity usuario = usuarioJpaRepository.findByTokenVerificacionEmail(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de verificación inválido"));

        if (usuario.getTokenEmailExpira() != null && usuario.getTokenEmailExpira().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El token de verificación ha expirado");
        }

        usuario.setEmailVerificado(true);
        usuario.setTokenVerificacionEmail(null);
        usuario.setTokenEmailExpira(null);

        boolean isEmpresa = Boolean.TRUE.equals(usuario.getEsEmpresa());
        if (usuario.getRol() == RolUsuario.COMPRADOR && !isEmpresa) {
            // Buyer (comprador natural)
            usuario.setEstadoCuenta("ACTIVA");
            usuario.setCuentaAprobada(true);
            usuario.setActivo(true);
            usuarioJpaRepository.save(usuario);

            // Generate welcome coupon
            com.agromarket.infrastructure.persistence.entity.CuponDescuento cupon = cuponService.generarCuponPrimerEnvio(usuario.getId());

            // Send welcome email with coupon
            try {
                java.util.Map<String, String> model = java.util.Map.of(
                    "nombre", usuario.getNombre(),
                    "codigoCupon", cupon.getCodigo(),
                    "catalogUrl", appProperties.frontendUrl() + "/catalogo"
                );
                mailService.sendTemplateMessage(usuario.getCorreo(), "¡Bienvenido a AgroMarket! 🎉 Tienes un regalo", "welcome-comprador", model);
            } catch (Exception e) {
                log.error("Failed to send welcome email to buyer {}", usuario.getCorreo(), e);
            }
        } else {
            // Productor or Comprador Empresa
            usuario.setEstadoCuenta("PENDIENTE_APROBACION");
            usuario.setCuentaAprobada(false);
            usuario.setActivo(true); // Allow active status but pending approval
            usuarioJpaRepository.save(usuario);

            // Send pending approval email
            try {
                java.util.Map<String, String> model = java.util.Map.of(
                    "nombre", usuario.getNombre()
                );
                mailService.sendTemplateMessage(usuario.getCorreo(), "Tu solicitud está en revisión ⏳", "aprobacion-pendiente", model);
            } catch (Exception e) {
                log.error("Failed to send pending approval email to {}", usuario.getCorreo(), e);
            }
        }
    }
}
