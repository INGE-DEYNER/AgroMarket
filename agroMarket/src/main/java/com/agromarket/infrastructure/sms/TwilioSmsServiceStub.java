package com.agromarket.infrastructure.sms;

import com.agromarket.application.service.SmsVerificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Primary
@Profile("!twilio")
@Slf4j
public class TwilioSmsServiceStub implements SmsVerificationService {

    @Override
    public void enviarCodigo(String telefono) {
        log.warn("SMS STUB: código enviado a {}", telefono);
    }

    @Override
    public boolean verificarCodigo(String telefono, String codigo) {
        log.warn("SMS STUB: verificación automática aprobada para {}", telefono);
        return true;
    }
}
