package com.agromarket.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.agromarket.infrastructure.email.BrevoEmailService;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

/**
 * Unit tests for BrevoEmailService (Brevo REST API).
 * Uses a mocked RestTemplate — no SMTP dependency.
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"null", "unchecked"})
class EmailServiceTest {

    private RestTemplate restTemplate;
    private BrevoEmailService emailService;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        emailService = new BrevoEmailService(restTemplate);
        // Inject @Value fields via reflection
        setField(emailService, "apiKey", "test-api-key");
        setField(emailService, "senderEmail", "noreply@agromarket.com");
        setField(emailService, "senderName", "AgroMarket");
    }

    @Test
    void sendSimpleMessage_callsBrevoApi() {
        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{}"));

        emailService.sendSimpleMessage("user@example.com", "Test Subject", "Hello");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<HttpEntity<Map<String, Object>>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(
                eq("https://api.brevo.com/v3/smtp/email"),
                captor.capture(),
                eq(String.class));

        Map<String, Object> body = captor.getValue().getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("subject")).isEqualTo("Test Subject");
        assertThat(body.get("htmlContent").toString()).contains("Hello");
    }

    @Test
    void sendTemplateMessage_loadsTemplateAndSends() {
        when(restTemplate.postForEntity(any(String.class), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{}"));

        Map<String, String> model = new HashMap<>();
        model.put("correo", "test@example.com");
        model.put("verifyUrl", "http://localhost/verify/abc123");

        emailService.sendTemplateMessage("test@example.com", "Verificación", "email-verification", model);

        verify(restTemplate).postForEntity(
                eq("https://api.brevo.com/v3/smtp/email"),
                any(HttpEntity.class),
                eq(String.class));
    }

    private static void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field " + fieldName, e);
        }
    }
}
