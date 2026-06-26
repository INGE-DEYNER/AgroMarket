package com.agromarket.application.service.impl;

import com.agromarket.application.service.EmailService;
import com.agromarket.application.service.PasswordPolicyService;
import com.agromarket.application.service.PasswordResetService;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UsuarioJpaRepository usuarioRepository;
    private final EmailService brevoEmailService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyService passwordPolicyService;

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        UsuarioEntity usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe cuenta con ese correo"));

        String codigo = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expira = LocalDateTime.now().plusMinutes(15);

        usuario.setTokenRecuperacionPassword(codigo);
        usuario.setTokenRecuperacionExpira(expira);
        usuarioRepository.save(usuario);

        try {
            brevoEmailService.sendPasswordResetEmail(
                    email,
                    usuario.getNombre(),
                    codigo,
                    "es"
            );
            log.info("Email de recuperación enviado a: {}", email);
        } catch (Exception e) {
            log.error("Error enviando email de recuperación a {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("No se pudo enviar el email. Intenta de nuevo en unos minutos.");
        }
    }

    @Override
    @Transactional
    public String verifyCode(String email, String codigo) {
        UsuarioEntity usuario = usuarioRepository.findByCorreo(email)
                .orElseThrow(() -> new CredencialesInvalidasException("Código inválido o expirado"));

        if (!codigo.equals(usuario.getTokenRecuperacionPassword())
                || LocalDateTime.now().isAfter(usuario.getTokenRecuperacionExpira())) {
            throw new CredencialesInvalidasException("Código inválido o expirado");
        }

        String tokenTemporal = UUID.randomUUID().toString();
        usuario.setTokenRecuperacionPassword(tokenTemporal);
        usuario.setTokenRecuperacionExpira(LocalDateTime.now().plusMinutes(10));
        usuarioRepository.save(usuario);

        return tokenTemporal;
    }

    @Override
    @Transactional
    public void resetPassword(String token, String nuevaContrasena) {
        UsuarioEntity usuario = usuarioRepository.findByTokenRecuperacionPassword(token)
                .orElseThrow(() -> new CredencialesInvalidasException("Token expirado. Solicita nuevo código."));

        if (LocalDateTime.now().isAfter(usuario.getTokenRecuperacionExpira())) {
            throw new CredencialesInvalidasException("Token expirado. Solicita nuevo código.");
        }
        
        passwordPolicyService.validarContrasenaNueva(usuario, nuevaContrasena);
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuario.setTokenRecuperacionPassword(null);
        usuario.setTokenRecuperacionExpira(null);
        usuarioRepository.save(usuario);
    }
}

