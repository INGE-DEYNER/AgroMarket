package com.agromarket.infrastructure.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings({"unchecked", "rawtypes"})
public class BrevoEmailServiceTest {

    private BrevoEmailService emailService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        emailService = new BrevoEmailService(restTemplate);
        ReflectionTestUtils.setField(emailService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(emailService, "senderEmail", "noreply@agromarket.co");
        ReflectionTestUtils.setField(emailService, "senderName", "AgroMarket");
    }

    @Test
    public void sendSimpleMessage_success() {
        when(restTemplate.postForEntity(eq("https://api.brevo.com/v3/smtp/email"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        emailService.sendSimpleMessage("test@example.com", "Test Subject", "Hello World");

        ArgumentCaptor<HttpEntity> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("https://api.brevo.com/v3/smtp/email"), captor.capture(), eq(String.class));

        HttpEntity<Map<String, Object>> entity = captor.getValue();
        assertThat(entity.getHeaders().getFirst("api-key")).isEqualTo("test-api-key");
        
        Map<String, Object> body = entity.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("subject")).isEqualTo("Test Subject");
        assertThat(body.get("htmlContent")).isEqualTo("<p>Hello World</p>");
    }

    @Test
    public void sendHtmlMessage_success() {
        when(restTemplate.postForEntity(eq("https://api.brevo.com/v3/smtp/email"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        emailService.sendHtmlMessage("test@example.com", "Test Html", "<h1>HTML</h1>");

        ArgumentCaptor<HttpEntity> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("https://api.brevo.com/v3/smtp/email"), captor.capture(), eq(String.class));

        HttpEntity<Map<String, Object>> entity = captor.getValue();
        Map<String, Object> body = entity.getBody();
        assertThat(body).isNotNull();
        assertThat(body.get("htmlContent")).isEqualTo("<h1>HTML</h1>");
    }

    @Test
    public void sendTemplateMessage_success() {
        when(restTemplate.postForEntity(eq("https://api.brevo.com/v3/smtp/email"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        Map<String, String> model = Map.of("codigo", "123456", "correoMascarado", "u***@example.com");
        // Corrected template name to match the expected generic name by resolveLocalizedTemplateName
        emailService.sendTemplateMessage("test@example.com", "Verifica", "email-verification", model);

        ArgumentCaptor<HttpEntity> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(eq("https://api.brevo.com/v3/smtp/email"), captor.capture(), eq(String.class));

        HttpEntity<Map<String, Object>> entity = captor.getValue();
        Map<String, Object> body = entity.getBody();
        assertThat(body).isNotNull();
        String htmlContent = (String) body.get("htmlContent");
        assertThat(htmlContent).contains("123456");
        assertThat(htmlContent).contains("u***@example.com");
    }

    @Test
    public void sendHtmlMessage_apiError() {
        when(restTemplate.postForEntity(eq("https://api.brevo.com/v3/smtp/email"), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("API error"));

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> 
                emailService.sendHtmlMessage("test@example.com", "Test", "body")
        );
    }
}
