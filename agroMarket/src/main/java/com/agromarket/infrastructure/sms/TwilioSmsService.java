package com.agromarket.infrastructure.sms;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioSmsService {

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

    public void enviarCodigoVerificacion(String telefono) {
        try {
            Verification verification = Verification.creator(
                verifyServiceSid, telefono, "sms"
            ).create();
            log.info("SMS enviado a {}: status={}", telefono, verification.getStatus());
        } catch (ApiException e) {
            log.error("Error enviando SMS a {}: {}", telefono, e.getMessage());
            throw new RuntimeException("No se pudo enviar el SMS de verificación. Verifica el número.");
        }
    }

    public boolean verificarCodigo(String telefono, String codigo) {
        try {
            VerificationCheck check = VerificationCheck.creator(verifyServiceSid)
                .setTo(telefono)
                .setCode(codigo)
                .create();
            boolean aprobado = "approved".equals(check.getStatus());
            log.info("Verificación SMS para {}: {}", telefono, check.getStatus());
            return aprobado;
        } catch (ApiException e) {
            log.error("Error verificando SMS: {}", e.getMessage());
            return false;
        }
    }
}
