package com.agromarket.application.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import com.agromarket.application.service.EmailService;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings({"null", "unused"})
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }

    @Override
    public void sendHtmlMessage(String to, String subject, String html) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Error sending HTML email", e);
        }
    }

    @Override
    public void sendTemplateMessage(String to, String subject, String templateName, Map<String, String> model) {
        try {
            ClassPathResource res = new ClassPathResource("templates/" + templateName + ".html");
            String template = StreamUtils.copyToString(res.getInputStream(), StandardCharsets.UTF_8);
            if (model != null) {
                for (Map.Entry<String, String> e : model.entrySet()) {
                    template = template.replace("${" + e.getKey() + "}", e.getValue());
                }
            }
            sendHtmlMessage(to, subject, template);
        } catch (IOException ex) {
            throw new RuntimeException("Error loading email template: " + templateName, ex);
        }
    }
}
