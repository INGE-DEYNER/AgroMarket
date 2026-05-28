package com.agromarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;

@Configuration
public class MailAutoConfiguration {

    @Bean
    @Primary
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender javaMailSender() {
        // Default no-op/simple JavaMailSender for tests and local dev when no SMTP is configured
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        // leave host/port empty so attempts to send will fail loudly if used without configuration
        return sender;
    }
}
