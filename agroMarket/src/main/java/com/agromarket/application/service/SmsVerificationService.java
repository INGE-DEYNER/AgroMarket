package com.agromarket.application.service;

import com.agromarket.infrastructure.sms.TwilioSmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsVerificationService {

    private final TwilioSmsService twilioSmsService;

    public void enviarSms(String to) {
        twilioSmsService.enviarCodigoVerificacion(to);
    }

    public boolean verificarSms(String to, String code) {
        return twilioSmsService.verificarCodigo(to, code);
    }
}

