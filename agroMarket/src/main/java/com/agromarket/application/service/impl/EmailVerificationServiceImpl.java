package com.agromarket.application.service.impl;

import java.time.LocalDateTime;
import java.security.SecureRandom;

import com.agromarket.config.properties.AppProperties;
import com.agromarket.application.service.EmailVerificationService;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.EmailVerificationTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final EmailVerificationTokenRepository repository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final com.agromarket.application.service.EmailService mailService;
    private final com.agromarket.application.service.RateLimiterService rateLimiterService;
    private final AppProperties appProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public void sendVerificationEmail(String correo) {
        // rate limit by correo: max 3 per hour (InMemoryRateLimiterService)
        String key = "verify:email:" + correo.toLowerCase();
        if (!rateLimiterService.tryAcquire(key)) {
            throw new com.agromarket.domain.exception.TooManyRequestsException("Límite de reenvíos alcanzado. Intenta más tarde.");
        }
        usuarioJpaRepository.findByCorreo(correo).ifPresent(this::sendVerificationEmail);
    }

    private String generarCodigo() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private String enmascararCorreo(String correo) {
        if (correo == null || !correo.contains("@")) {
            return correo;
        }
        String[] partes = correo.split("@", 2);
        String usuario = partes[0];
        String dominio = partes[1];
        if (usuario.length() <= 2) {
            return usuario.charAt(0) + "***@" + dominio;
        }
        return usuario.charAt(0) + "***" + usuario.charAt(usuario.length() - 1) + "@" + dominio;
    }

    @Override
    @Transactional
    public void sendVerificationEmail(UsuarioEntity usuario) {
        // remove previous
        repository.deleteByUsuarioId(usuario.getId());
        String token = generarCodigo();
        EmailVerificationTokenEntity entity = EmailVerificationTokenEntity.builder()
                .token(token)
                .usuario(usuario)
                .expiry(LocalDateTime.now().plusMinutes(15))
                .verificado(false)
                .build();
        repository.save(entity);

        String verifyUrl = appProperties.frontendUrl() + "/verificar/" + token;
        java.util.Map<String, String> model = java.util.Map.of(
                "verifyUrl", verifyUrl,
                "codigo", token,
                "correo", usuario.getCorreo(),
                "correoMascarado", enmascararCorreo(usuario.getCorreo()));
        try {
            mailService.sendTemplateMessage(usuario.getCorreo(), "AgroMarket - Verifica tu correo", "email-verification", model);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(EmailVerificationServiceImpl.class)
                    .error("Failed to send verification email to {}: {}", usuario.getCorreo(), e.getMessage());
        }
    }

    @Override
    @Transactional
    public UsuarioEntity verifyCode(String correo, String codigo) {
        EmailVerificationTokenEntity entity = repository.findByToken(codigo)
                .orElseThrow(() -> new CredencialesInvalidasException("Código de verificación inválido"));
        if (entity.getVerificado() != null && entity.getVerificado()) {
            throw new CredencialesInvalidasException("Código de verificación inválido");
        }
        if (!entity.getUsuario().getCorreo().equalsIgnoreCase(correo)) {
            throw new CredencialesInvalidasException("Código de verificación inválido");
        }
        if (entity.getExpiry().isBefore(LocalDateTime.now())) {
            repository.delete(entity);
            throw new CredencialesInvalidasException("Código de verificación expirado");
        }
        UsuarioEntity usuario = entity.getUsuario();
        usuario.setEmailVerificado(true);
        // If user is a producer, do not activate automatically; remain pending admin approval
        if (usuario.getRol() != null && usuario.getRol().name().equals("PRODUCTOR")) {
            usuario.setActivo(true);
            usuario.setAprobado(false);
        } else {
            usuario.setActivo(true);
            usuario.setAprobado(true);
        }
        usuarioJpaRepository.save(usuario);
        entity.setVerificado(true);
        repository.save(entity);

        sendWelcomeEmailIfComprador(usuario);

        return usuario;
    }

    @Override
    @Transactional
    public UsuarioEntity verifyToken(String token) {
        EmailVerificationTokenEntity entity = repository.findByToken(token)
                .orElseThrow(() -> new CredencialesInvalidasException("Token de verificación inválido"));
        if (entity.getVerificado() != null && entity.getVerificado()) {
            throw new CredencialesInvalidasException("Token de verificación inválido");
        }
        if (entity.getExpiry().isBefore(LocalDateTime.now())) {
            repository.delete(entity);
            throw new CredencialesInvalidasException("Token de verificación expirado");
        }
        UsuarioEntity usuario = entity.getUsuario();
        usuario.setEmailVerificado(true);
        if (usuario.getRol() != null && usuario.getRol().name().equals("PRODUCTOR")) {
            usuario.setActivo(true);
            usuario.setAprobado(false);
        } else {
            usuario.setActivo(true);
            usuario.setAprobado(true);
        }
        usuarioJpaRepository.save(usuario);
        entity.setVerificado(true);
        repository.save(entity);

        sendWelcomeEmailIfComprador(usuario);

        return usuario;
    }

    private void sendWelcomeEmailIfComprador(UsuarioEntity usuario) {
        if (usuario.getRol() == com.agromarket.domain.model.RolUsuario.COMPRADOR) {
            try {
                mailService.sendTemplateMessage(usuario.getCorreo(), "¡Bienvenido a AgroMarket!", "welcome", java.util.Map.of());
                org.slf4j.LoggerFactory.getLogger(EmailVerificationServiceImpl.class)
                        .info("Welcome email successfully sent/logged to comprador {}", usuario.getCorreo());
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(EmailVerificationServiceImpl.class)
                        .error("Failed to send welcome email to comprador {}: {}", usuario.getCorreo(), e.getMessage());
            }
        }
    }
}
