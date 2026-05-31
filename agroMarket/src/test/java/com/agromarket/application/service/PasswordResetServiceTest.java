package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.config.TestMailConfig.CapturingMailSender;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.entity.PasswordResetTokenEntity;
import com.agromarket.infrastructure.persistence.repository.PasswordResetTokenRepository;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import java.util.List;
import java.util.Objects;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
@Import(com.agromarket.config.TestMailConfig.class)
public class PasswordResetServiceTest {

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UsuarioJpaRepository usuarioJpaRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender javaMailSender;

    @Test
    public void requestPasswordReset_createsTokenAndSendsEmail() throws Exception {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("Test User")
                .correo("reset-test@example.com")
                .contrasena("secret")
                .telefono("3001234567")
                .build();

        usuarioJpaRepository.save(Objects.requireNonNull(comprador));

        CapturingMailSender sender = (CapturingMailSender) javaMailSender;
        // clear any previous captured messages to isolate this test
        sender.getMessages().clear();

        passwordResetService.requestPasswordReset("reset-test@example.com");

        List<PasswordResetTokenEntity> tokens = tokenRepository.findAll();
        assertThat(tokens).hasSize(1);

        List<MimeMessage> messages = sender.getMessages();
        assertThat(messages).hasSize(1);
        String content = messages.get(0).getContent().toString();
        assertThat(content).contains("restablecer-contrasena.html");
    }
}
