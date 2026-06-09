package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

/**
 * Integration test for password reset flow.
 * Replaces GreenMail-based IT — email sending is mocked via Brevo/EmailService mock.
 */
@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
@SuppressWarnings({"null", "unused"})
public class PasswordResetGreenMailIT {

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UsuarioJpaRepository usuarioJpaRepository;

    @MockBean
    private EmailService emailService;

    @Test
    public void passwordReset_sendsEmail_viaBrevMock() {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("GM Test")
                .correo("greenmail-test@example.com")
                .contrasena("pw")
                .telefono("3000000")
                .build();
        usuarioJpaRepository.save(comprador);

        passwordResetService.requestPasswordReset("greenmail-test@example.com");

        verify(emailService, atLeastOnce()).sendTemplateMessage(
                eq("greenmail-test@example.com"),
                anyString(),
                anyString(),
                any());
    }
}
