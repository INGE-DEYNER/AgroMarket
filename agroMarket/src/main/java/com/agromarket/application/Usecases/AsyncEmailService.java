package com.agromarket.application.usecases;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.agromarket.application.ports.in.EmailService;

import java.util.Map;

@Service
public class AsyncEmailService {

    private final EmailService emailService;

    public AsyncEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        emailService.sendSimpleMessage(to, subject, text);
    }

    @Async
    public void sendHtmlMessage(String to, String subject, String html) {
        emailService.sendHtmlMessage(to, subject, html);
    }

    @Async
    public void sendPasswordResetEmail(String to, String userName, String resetCode, String locale) {
        emailService.sendPasswordResetEmail(to, userName, resetCode, locale);
    }

    @Async
    public void sendTemplateMessage(String to, String subject, String templateName, Map<String, String> model) {
        emailService.sendTemplateMessage(to, subject, templateName, model);
    }
}
