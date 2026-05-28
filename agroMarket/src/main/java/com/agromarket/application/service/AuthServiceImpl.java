package com.agromarket.application.service;

import com.agromarket.application.dto.AuthResponse;
import com.agromarket.application.dto.LoginRequest;
import com.agromarket.application.dto.RegistroRequest;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.UsuarioYaExisteException;
import com.agromarket.domain.model.Administrador;
import com.agromarket.domain.model.Comprador;
import com.agromarket.domain.model.Productor;
import com.agromarket.domain.model.RolUsuario;
import com.agromarket.infrastructure.persistence.entity.AdministradorEntity;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.ProductorEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtTokenProvider;

import java.time.LocalDateTime;

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
        UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new CredencialesInvalidasException("Correo o contraseña incorrectos"));
        if (!usuario.isActivo() || !passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new CredencialesInvalidasException("Correo o contraseña incorrectos");
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

    @Override
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
