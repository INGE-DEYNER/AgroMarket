package com.agromarket.application.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import com.agromarket.application.service.EmailVerificationService;
import com.agromarket.domain.exception.CredencialesInvalidasException;
import com.agromarket.infrastructure.persistence.entity.EmailVerificationTokenEntity;
import com.agromarket.infrastructure.persistence.entity.UsuarioEntity;
import com.agromarket.infrastructure.persistence.repository.EmailVerificationTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private final EmailVerificationTokenRepository repository;
    private final UsuarioJpaRepository usuarioJpaRepository;
    private final com.agromarket.application.service.EmailService mailService;

    @Override
    public void sendVerificationEmail(String correo) {
        usuarioJpaRepository.findByCorreo(correo).ifPresent(this::sendVerificationEmail);
    }

    @Override
    @Transactional
    public void sendVerificationEmail(UsuarioEntity usuario) {
        // remove previous
        repository.deleteByUsuarioId(usuario.getId());
        String token = UUID.randomUUID().toString();
        EmailVerificationTokenEntity entity = EmailVerificationTokenEntity.builder()
                .token(token)
                .usuario(usuario)
                .expiry(LocalDateTime.now().plusDays(2))
                .build();
        repository.save(entity);

        String verifyUrl = "http://localhost:3000/verificar-correo.html?token=" + token + "&correo=" + usuario.getCorreo();
        java.util.Map<String, String> model = java.util.Map.of("verifyUrl", verifyUrl, "correo", usuario.getCorreo());
        mailService.sendTemplateMessage(usuario.getCorreo(), "AgroMarket - Verifica tu correo", "email-verification", model);
    }

    @Override
    @Transactional
    public void verifyToken(String token) {
        EmailVerificationTokenEntity entity = repository.findByToken(token)
                .orElseThrow(() -> new CredencialesInvalidasException("Token de verificación inválido"));
        if (entity.getExpiry().isBefore(LocalDateTime.now())) {
            repository.delete(entity);
            throw new CredencialesInvalidasException("Token de verificación expirado");
        }
        UsuarioEntity usuario = entity.getUsuario();
        usuario.setActivo(true);
        usuarioJpaRepository.save(usuario);
        repository.delete(entity);
    }
}
