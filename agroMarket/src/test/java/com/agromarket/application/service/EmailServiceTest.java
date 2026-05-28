package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.agromarket.config.TestMailConfig.CapturingMailSender;
import java.util.HashMap;
import java.util.Map;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest(classes = com.asafrut.agroMarket.AgroMarketApplication.class)
@Import(com.agromarket.config.TestMailConfig.class)
public class EmailServiceTest {

    @Autowired
    private com.agromarket.application.service.EmailService emailService;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender javaMailSender;

    @Test
    public void sendTemplateMessage_rendersTemplateAndSends() throws Exception {
        CapturingMailSender sender = (CapturingMailSender) javaMailSender;

        Map<String, String> model = new HashMap<>();
        model.put("correo", "test@example.com");
        model.put("verifyUrl", "http://localhost/verify/abc123");

        emailService.sendTemplateMessage("test@example.com", "Prueba verificación", "email-verification", model);

        assertThat(sender.getMessages()).hasSize(1);
        MimeMessage sent = sender.getMessages().get(0);
        String content = sent.getContent().toString();
        assertThat(content).contains("verify");
        assertThat(sent.getAllRecipients()[0].toString()).isEqualTo("test@example.com");
    }
}
