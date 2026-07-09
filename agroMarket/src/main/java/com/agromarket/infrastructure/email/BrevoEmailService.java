package com.agromarket.infrastructure.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import com.agromarket.domain.ports.EmailService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;

@Service
@Slf4j
@Async
public class BrevoEmailService implements EmailService {

    private final RestTemplate restTemplate;
    private final Map<String, String> templateCache = new ConcurrentHashMap<>();

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    public BrevoEmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        sendHtmlMessage(to, subject, "<p>" + text + "</p>");
    }

    @Override
    public void sendHtmlMessage(String to, String subject, String html) {
        if (apiKey == null || apiKey.trim().isEmpty() || "mock-key".equalsIgnoreCase(apiKey) || apiKey.startsWith("mock")) {
            log.info("----- MOCK EMAIL LOG -----");
            log.info("To: {}", to);
            log.info("Subject: {}", subject);
            log.info("HTML Content: {}", html);
            log.info("-----------------------------");
            return;
        }

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

    private String getTemplateFromCache(String templateName) {
        return templateCache.computeIfAbsent(templateName, name -> {
            try {
                ClassPathResource res = new ClassPathResource("email-templates/" + name + ".html");
                return StreamUtils.copyToString(res.getInputStream(), StandardCharsets.UTF_8);
            } catch (IOException ex) {
                throw new RuntimeException("Error loading email template: " + name, ex);
            }
        });
    }

    @Override
    public void sendPasswordResetEmail(String to, String userName, String resetCode, String locale) {
        String resolvedLocale = (locale != null && List.of("es","en","pt","fr","de","zh","ar").contains(locale)) ? locale : "es";
        String resolvedTemplateName = "reset_" + resolvedLocale;
        try {
            String template = getTemplateFromCache(resolvedTemplateName);
            template = template.replace("${codigo}", resetCode)
                               .replace("{{reset_code}}", resetCode)
                               .replace("${user_name}", userName != null ? userName : "Usuario")
                               .replace("{{user_name}}", userName != null ? userName : "Usuario");
            String subject = resolvedLocale.equals("en") ? "AgroMarket - Password Recovery Code" : "Código de recuperación AgroMarket";
            sendHtmlMessage(to, subject, template);
        } catch (Exception ex) {
            log.error("Error loading password reset template for locale {}: {}", resolvedLocale, ex.getMessage());
            throw new RuntimeException("Error loading email template: " + resolvedTemplateName, ex);
        }
    }

    @Override
    public void sendTemplateMessage(String to, String subject, String templateName, Map<String, String> model) {
        String resolvedTemplateName = resolveLocalizedTemplateName(templateName);
        try {
            String template = getTemplateFromCache(resolvedTemplateName);
            if (model != null) {
                for (Map.Entry<String, String> e : model.entrySet()) {
                    template = template.replace("${" + e.getKey() + "}", e.getValue());
                }
            }
            sendHtmlMessage(to, subject, template);
        } catch (Exception ex) {
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
        } else if ("welcome-comprador".equals(templateName) || "bienvenida-comprador".equals(templateName)) {
            return "bienvenida_comprador_" + lang;
        } else if ("welcome-productor".equals(templateName) || "bienvenida-productor".equals(templateName)) {
            return "bienvenida_productor_" + lang;
        } else if ("aprobacion-pendiente".equals(templateName) || "pendiente".equals(templateName)) {
            return "pendiente_" + lang;
        } else if ("productor-aprobado".equals(templateName)) {
            return "aprobacion_" + lang;
        } else if ("productor-rechazado".equals(templateName)) {
            return "rechazo_" + lang;
        }
        return templateName + "_" + lang;
    }
}
