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
@org.springframework.context.annotation.Import(EmailVerificationGreenMailIT.MailConfig.class)
public class EmailVerificationGreenMailIT {

    private static GreenMail greenMail = new GreenMail(ServerSetupTest.SMTP);

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
    private EmailVerificationService emailVerificationService;

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
    public void emailVerification_sendsEmail_and_verifiesToken() throws Exception {
        CompradorEntity comprador = CompradorEntity.builder()
                .nombre("EV Test")
                .correo("verify-greenmail@example.com")
                .contrasena("pw")
                .telefono("3000000")
                .activo(false)
                .build();
        usuarioJpaRepository.save(comprador);

        // Ensure inbox empty
        greenMail.purgeEmailFromAllMailboxes();

        emailVerificationService.sendVerificationEmail("verify-greenmail@example.com");

        MimeMessage[] received = greenMail.getReceivedMessages();
        assertThat(received).hasSize(1);
        String content = (String) received[0].getContent();
        assertThat(content).contains("verificar-correo.html");

        // extract token from content
        String token = null;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("token=([a-f0-9\\-]+)").matcher(content);
        if (m.find()) token = m.group(1);
        assertThat(token).isNotNull();

        // verify token activates user
        emailVerificationService.verifyToken(token);

        CompradorEntity updated = (CompradorEntity) usuarioJpaRepository.findByCorreo("verify-greenmail@example.com").orElseThrow();
        assertThat(updated.isActivo()).isTrue();
    }
}
