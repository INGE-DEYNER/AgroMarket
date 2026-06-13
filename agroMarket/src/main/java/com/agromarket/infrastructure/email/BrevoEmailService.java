package com.agromarket.infrastructure.email;

import com.agromarket.application.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@SuppressWarnings({"null", "unused"})
public class BrevoEmailService implements EmailService {

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public BrevoEmailService() {
        this.restTemplate = new RestTemplate();
    }

    public BrevoEmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        sendHtmlMessage(to, subject, "<p>" + text + "</p>");
    }

    @Override
    public void sendHtmlMessage(String to, String subject, String html) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", Map.of("name", senderName, "email", senderEmail));
        body.put("to", List.of(Map.of("email", to)));
        body.put("subject", subject);
        body.put("htmlContent", html);

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {} via Brevo API: {}. Printing contents to logs.", to, e.getMessage());
            log.info("----- OFFLINE EMAIL LOG -----");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("HTML Content: {}", html);
            log.info("-----------------------------");
        }
    }

    @Override
    public void sendTemplateMessage(String to, String subject, String templateName, Map<String, String> model) {
        String resolvedTemplateName = resolveLocalizedTemplateName(templateName);
        try {
            ClassPathResource res = new ClassPathResource("email-templates/" + resolvedTemplateName + ".html");
            String template = StreamUtils.copyToString(res.getInputStream(), StandardCharsets.UTF_8);
            if (model != null) {
                for (Map.Entry<String, String> e : model.entrySet()) {
                    template = template.replace("${" + e.getKey() + "}", e.getValue());
                }
            }
            sendHtmlMessage(to, subject, template);
        } catch (IOException ex) {
            throw new RuntimeException("Error loading email template: " + resolvedTemplateName, ex);
        }
    }

    private String resolveLocalizedTemplateName(String templateName) {
        String lang = "es";
        try {
            if (LocaleContextHolder.getLocale() != null) {
                String reqLang = LocaleContextHolder.getLocale().getLanguage();
                if (reqLang != null && !reqLang.isEmpty()) {
                    lang = reqLang.toLowerCase();
                }
            }
        } catch (Exception e) {
            // Ignore and fallback
        }

        if (!Arrays.asList("es", "en", "pt", "fr", "de", "zh", "ar").contains(lang)) {
            lang = "es";
        }

        if ("email-verification".equals(templateName)) {
            return "verificacion_" + lang;
        } else if ("password-reset".equals(templateName)) {
            return "reset_" + lang;
        } else if ("welcome".equals(templateName) || "bienvenida".equals(templateName)) {
            return "bienvenida_" + lang;
        } else if ("productor-aprobado".equals(templateName)) {
            return "aprobacion_" + lang;
        } else if ("productor-rechazado".equals(templateName)) {
            return "rechazo_" + lang;
        }
        return templateName + "_" + lang;
    }
}
