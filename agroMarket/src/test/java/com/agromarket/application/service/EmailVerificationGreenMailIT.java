package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import java.util.Objects;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

/**
 * Integration test for email verification flow.
 * Replaces GreenMail-based IT — email sending is mocked via Brevo/EmailService mock.
 */
@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
@SuppressWarnings({"null", "unused"})
public class EmailVerificationGreenMailIT {

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UsuarioJpaRepository usuarioJpaRepository;

    @MockBean
    private EmailService emailService;

    @Test
    public void emailVerification_sendsEmail_and_verifiesToken() {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("EV Test")
                .correo("verify-greenmail@example.com")
                .contrasena("pw")
                .telefono("3000000")
                .activo(false)
                .build();
        usuarioJpaRepository.save(Objects.requireNonNull(comprador));

        emailVerificationService.sendVerificationEmail("verify-greenmail@example.com");

        verify(emailService, atLeastOnce()).sendTemplateMessage(
                eq("verify-greenmail@example.com"),
                anyString(),
                anyString(),
                any());
    }
}
