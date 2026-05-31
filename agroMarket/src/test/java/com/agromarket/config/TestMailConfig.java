package com.agromarket.config;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.lang.NonNull;

@TestConfiguration
public class TestMailConfig {

    public static class CapturingMailSender extends JavaMailSenderImpl {
        private final List<MimeMessage> messages = new ArrayList<>();

        @Override
        public void send(@NonNull MimeMessage mimeMessage) {
            messages.add(mimeMessage);
        }

        @Override
        public void send(@NonNull MimeMessage... mimeMessages) {
            Collections.addAll(messages, mimeMessages);
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
