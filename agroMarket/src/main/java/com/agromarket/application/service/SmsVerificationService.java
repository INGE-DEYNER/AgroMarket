package com.agromarket.application.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmsVerificationService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.verify.service.sid:}")
    private String serviceSid;

    private final RestTemplate restTemplate = new RestTemplate();

    public void enviarSms(String to) {
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank() || serviceSid == null || serviceSid.isBlank()) {
            log.warn("Twilio credentials are not configured. Mocking SMS verification code sent to {}", to);
            return;
        }

        String url = "https://verify.twilio.com/v2/Services/" + serviceSid + "/Verifications";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = accountSid + ":" + authToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("To", to);
        map.add("Channel", "sms");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        try {
            restTemplate.postForEntity(url, request, String.class);
            log.info("Twilio SMS verification sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send Twilio SMS verification to {}: {}", to, e.getMessage());
            throw new RuntimeException("Error al enviar SMS de verificación: " + e.getMessage(), e);
        }
    }

    public boolean verificarSms(String to, String code) {
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank() || serviceSid == null || serviceSid.isBlank()) {
            log.warn("Twilio credentials are not configured. Mocking validation of SMS code. Any 6-digit code will pass.");
            return code != null && code.length() == 6;
        }

        String url = "https://verify.twilio.com/v2/Services/" + serviceSid + "/VerificationCheck";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = accountSid + ":" + authToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("To", to);
        map.add("Code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
        try {
            ResponseEntity<?> response = restTemplate.postForEntity(url, request, java.util.Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof java.util.Map<?, ?> body) {
                String status = (String) body.get("status");
                return "approved".equals(status);
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to check Twilio SMS verification for {}: {}", to, e.getMessage());
            return false;
        }
    }
}
