package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.PasswordResetTokenEntity;
import com.agromarket.infrastructure.persistence.repository.PasswordResetTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
public class PasswordResetServiceTest {

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UsuarioJpaRepository usuarioJpaRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @MockBean
    private EmailService emailService;

    @Test
    public void requestPasswordReset_createsTokenAndSendsEmail() {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("Test User")
                .correo("reset-test@example.com")
                .contrasena("secret")
                .telefono("3001234567")
                .build();

        usuarioJpaRepository.save(java.util.Objects.requireNonNull(comprador));

        passwordResetService.requestPasswordReset("reset-test@example.com");

        List<PasswordResetTokenEntity> tokens = tokenRepository.findAll();
        assertThat(tokens).isNotEmpty();

        verify(emailService, atLeastOnce()).sendTemplateMessage(
                eq("reset-test@example.com"),
                anyString(),
                anyString(),
                any());
    }
}
