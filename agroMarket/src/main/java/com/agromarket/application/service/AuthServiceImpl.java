package com.agromarket.application.service;

import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.UsuarioYaExisteException;
import com.agromarket.domain.model.RolUsuario;
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
    @Transactional
    public void registro(RegistroRequest request) {
        if (usuarioJpaRepository.existsByCorreo(request.getCorreo())) {
            throw new UsuarioYaExisteException("Ya existe un usuario con ese correo");
        }
        UsuarioEntity usuario = crearEntidad(request);
        usuario.setNombre(compactarNombre(request.getNombre(), request.getApellido()));
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setTelefono(request.getTelefono());
        // Require email verification before activating the account
        usuario.setActivo(false);
        usuario.setFechaRegistro(LocalDateTime.now());
        UsuarioEntity guardado = usuarioJpaRepository.save(usuario);
        // send verification email
        emailVerificationService.sendVerificationEmail(guardado);
    }

    @Override
    public String iniciarGoogleOAuth2() {
        return "/oauth2/authorization/google";
    }

    @Override
    @Transactional
    public AuthResponse completarGoogleOAuth2(String email, String nombre, String googleSubject) {
        UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(email).orElse(null);

        if (usuario == null) {
            CompradorEntity comprador = CompradorEntity.builder().build();
            comprador.setRol(RolUsuario.COMPRADOR);
            comprador.setCorreo(email);
            comprador.setNombre(nombre != null && !nombre.isBlank() ? nombre : email);
            comprador.setTelefono("0000000000");
            comprador.setContrasena(passwordEncoder.encode(UUID.randomUUID().toString()));
            comprador.setActivo(true);
            comprador.setFechaRegistro(LocalDateTime.now());
            usuario = usuarioJpaRepository.save(comprador);
        } else if (!usuario.isActivo()) {
            usuario.setActivo(true);
            usuario = usuarioJpaRepository.save(usuario);
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
