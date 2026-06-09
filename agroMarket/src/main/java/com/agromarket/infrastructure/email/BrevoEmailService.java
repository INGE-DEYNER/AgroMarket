package com.agromarket.infrastructure.email;

import com.agromarket.application.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
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

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);
    }

    @Override
    public void sendTemplateMessage(String to, String subject, String templateName, Map<String, String> model) {
        try {
            ClassPathResource res = new ClassPathResource("email-templates/" + templateName + ".html");
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
