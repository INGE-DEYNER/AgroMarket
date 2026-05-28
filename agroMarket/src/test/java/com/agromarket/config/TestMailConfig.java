package com.agromarket.config;

import java.util.ArrayList;
import java.util.List;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@TestConfiguration
public class TestMailConfig {

    public static class CapturingMailSender extends JavaMailSenderImpl {
        private final List<MimeMessage> messages = new ArrayList<>();

        @Override
        public void send(MimeMessage mimeMessage) {
            messages.add(mimeMessage);
        }

        @Override
        public void send(MimeMessage... mimeMessages) {
            for (MimeMessage m : mimeMessages) messages.add(m);
        }

        public List<MimeMessage> getMessages() {
            return messages;
        }
    }

    @Bean
    public JavaMailSender testJavaMailSender() {
        return new CapturingMailSender();
    }
}
