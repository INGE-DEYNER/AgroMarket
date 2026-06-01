package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetupTest;
import com.agromarket.infrastructure.persistence.entity.CompradorEntity;
import com.agromarket.infrastructure.persistence.repository.UsuarioJpaRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
@org.springframework.context.annotation.Import(PasswordResetGreenMailIT.MailConfig.class)
@SuppressWarnings({"null", "unused"})
public class PasswordResetGreenMailIT {

    private static final GreenMail greenMail = new GreenMail(ServerSetupTest.SMTP);

    static {
        greenMail.start();
    }

    @AfterAll
    public static void stopGreenMail() {
        if (greenMail != null) greenMail.stop();
    }

    @DynamicPropertySource
    static void mailProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> ServerSetupTest.SMTP.getPort());
        registry.add("spring.mail.protocol", () -> "smtp");
    }

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UsuarioJpaRepository usuarioJpaRepository;

    @org.springframework.boot.test.context.TestConfiguration
    public static class MailConfig {
        @org.springframework.context.annotation.Bean
        public org.springframework.mail.javamail.JavaMailSender javaMailSender() {
            org.springframework.mail.javamail.JavaMailSenderImpl impl = new org.springframework.mail.javamail.JavaMailSenderImpl();
            impl.setHost("localhost");
            impl.setPort(ServerSetupTest.SMTP.getPort());
            return impl;
        }
    }

    @Test
    public void passwordReset_sendsEmail_viaGreenMail() throws Exception {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("GM Test")
                .correo("greenmail-test@example.com")
                .contrasena("pw")
                .telefono("3000000")
                .build();
        usuarioJpaRepository.save(comprador);

        // Ensure inbox empty
        greenMail.purgeEmailFromAllMailboxes();

        passwordResetService.requestPasswordReset("greenmail-test@example.com");

        MimeMessage[] received = greenMail.getReceivedMessages();
        assertThat(received).hasSize(1);
        String content = (String) received[0].getContent();
        assertThat(content).contains("restablecer-contrasena.html");
    }
}
