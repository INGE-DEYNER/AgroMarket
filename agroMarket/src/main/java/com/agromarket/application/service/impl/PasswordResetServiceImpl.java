package com.agromarket.application.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import com.agromarket.config.properties.AppProperties;
import com.agromarket.application.service.PasswordResetService;
import com.agromarket.application.service.EmailService;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.infrastructure.persistence.entity.PasswordResetTokenEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.PasswordResetTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import com.agromarket.infrastructure.security.JwtTokenProvider;

import java.security.SecureRandom;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class PasswordResetServiceImpl implements PasswordResetService {
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;
    private final com.agromarket.application.service.PasswordPolicyService passwordPolicyService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void requestPasswordReset(String correo) {
        UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(correo)
                .orElseThrow(() -> new com.agromarket.domain.exception.RecursoNoEncontradoException("El correo electrónico no está registrado."));

        if (!usuario.isEmailVerificado()) {
            throw new CredencialesInvalidasException("El correo electrónico no está verificado.");
        }

        tokenRepository.deleteByUsuarioId(usuario.getId());

        String codigo = String.format("%06d", secureRandom.nextInt(1000000));
        String hashedToken = passwordEncoder.encode(codigo);
        
        PasswordResetTokenEntity entity = PasswordResetTokenEntity.builder()
            .token(hashedToken)
            .usuario(usuario)
            .expiry(LocalDateTime.now().plusMinutes(10))
            .usado(false)
            .build();
        tokenRepository.save(entity);

        java.util.Map<String, String> model = java.util.Map.of("codigo", codigo);
        try {
            mailService.sendTemplateMessage(usuario.getCorreo(), "Código de recuperación AgroMarket 🔐", "password-reset", model);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(PasswordResetServiceImpl.class)
                    .error("Failed to send password reset email to {}: {}", usuario.getCorreo(), e.getMessage());
            throw new RuntimeException("Error al enviar el correo de recuperación", e);
        }
    }

    @Override
    @Transactional
    public String verifyCode(String correo, String codigo) {
        UsuarioEntity usuario = usuarioJpaRepository.findByCorreo(correo)
            .orElseThrow(() -> new CredencialesInvalidasException("Código inválido o expirado"));

        PasswordResetTokenEntity entity = tokenRepository.findFirstByUsuarioIdOrderByIdDesc(usuario.getId())
            .filter(t -> !t.getUsado() && t.getExpiry().isAfter(LocalDateTime.now()))
            .filter(t -> passwordEncoder.matches(codigo, t.getToken()))
            .orElseThrow(() -> new CredencialesInvalidasException("Código inválido o expirado"));

        entity.setUsado(true);
        tokenRepository.save(entity);

        return jwtTokenProvider.generatePasswordResetToken(usuario.getCorreo(), usuario.getId());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String nuevaContrasena) {
        if (!jwtTokenProvider.validateToken(token) || !jwtTokenProvider.isPasswordResetToken(token)) {
            throw new CredencialesInvalidasException("Token de restablecimiento inválido o expirado");
        }
        
        Long userId = jwtTokenProvider.extractUserId(token);
        UsuarioEntity usuario = usuarioJpaRepository.findById(userId)
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario no encontrado"));
                
        passwordPolicyService.validarContrasenaNueva(usuario, nuevaContrasena);
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        UsuarioEntity guardado = usuarioJpaRepository.save(usuario);
        passwordPolicyService.registrarContrasenaEnHistorial(guardado);
    }
}
