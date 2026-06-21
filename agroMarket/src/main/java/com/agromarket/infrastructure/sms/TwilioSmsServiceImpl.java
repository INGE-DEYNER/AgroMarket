package com.agromarket.infrastructure.sms;

import com.agromarket.application.service.SmsVerificationService;
import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Profile("twilio")
public class TwilioSmsServiceImpl implements SmsVerificationService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.verify.service-sid}")
    private String verifyServiceSid;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() && authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
        } else {
            log.warn("Twilio no está configurado correctamente");
        }
    }

    @Override
    public void enviarCodigo(String telefono) {
        if (verifyServiceSid == null || verifyServiceSid.trim().isEmpty() || verifyServiceSid.startsWith("mock") || accountSid == null || accountSid.trim().isEmpty() || accountSid.startsWith("mock")) {
            log.info("----- MOCK SMS SENT -----");
            log.info("To: {}", telefono);
            log.info("Code: 123456 (Mocked)");
            log.info("-------------------------");
            return;
        }
        try {
            Verification verification = Verification.creator(
                verifyServiceSid, telefono, "sms"
            ).create();
            log.info("SMS enviado a {}: status={}", telefono, verification.getStatus());
        } catch (Exception e) {
            log.error("Error enviando SMS a {}: {}", telefono, e.getMessage());
            throw new RuntimeException("Servicio de verificación no disponible temporalmente", e);
        }
    }

    @Override
    public boolean verificarCodigo(String telefono, String codigo) {
        if (verifyServiceSid == null || verifyServiceSid.trim().isEmpty() || verifyServiceSid.startsWith("mock") || accountSid == null || accountSid.trim().isEmpty() || accountSid.startsWith("mock")) {
            throw new RuntimeException("Servicio de verificación no disponible temporalmente");
        }
        try {
            VerificationCheck check = VerificationCheck.creator(verifyServiceSid)
                .setTo(telefono)
                .setCode(codigo)
                .create();
            boolean aprobado = "approved".equals(check.getStatus());
            log.info("Verificación SMS para {}: {}", telefono, check.getStatus());
            return aprobado;
        } catch (Exception e) {
            log.error("Error verificando SMS: {}", e.getMessage());
            throw new RuntimeException("Servicio de verificación no disponible temporalmente", e);
        }
    }
}
