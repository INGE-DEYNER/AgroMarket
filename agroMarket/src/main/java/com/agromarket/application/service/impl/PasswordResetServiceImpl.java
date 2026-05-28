package com.agromarket.application.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import com.agromarket.application.service.PasswordResetService;
import com.agromarket.application.service.EmailService;
import com.agromarket.domain.exception.RecursoNoEncontradoException;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.infrastructure.persistence.entity.PasswordResetTokenEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PasswordResetTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final com.agromarket.application.service.EmailVerificationService emailVerificationService;

    @Override
    @Transactional
    public void requestPasswordReset(String correo) {
        usuarioJpaRepository.findByCorreo(correo).ifPresent(usuario -> {
            // remove existing tokens for user
            tokenRepository.deleteByUsuarioId(usuario.getId());

            String token = UUID.randomUUID().toString();
            PasswordResetTokenEntity entity = PasswordResetTokenEntity.builder()
                .token(token)
                .usuario(usuario)
                .expiry(LocalDateTime.now().plusHours(1))
                .usado(false)
                .build();
            tokenRepository.save(entity);

                    String resetUrl = "http://localhost:3000/restablecer-contrasena.html?token=" + token;
                    java.util.Map<String, String> model = java.util.Map.of("resetUrl", resetUrl);
                    mailService.sendTemplateMessage(usuario.getCorreo(), "AgroMarket - Recuperación de contraseña", "password-reset", model);
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String nuevaContrasena) {
        PasswordResetTokenEntity entity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new CredencialesInvalidasException("Token inválido o expirado"));
        if (entity.getUsado() != null && entity.getUsado()) {
            throw new CredencialesInvalidasException("Token inválido o expirado");
        }
        if (entity.getExpiry().isBefore(LocalDateTime.now())) {
            throw new CredencialesInvalidasException("Token inválido o expirado");
        }
        UsuarioEntity usuario = entity.getUsuario();
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuarioJpaRepository.save(usuario);
        entity.setUsado(true);
        tokenRepository.save(entity);
    }
}
