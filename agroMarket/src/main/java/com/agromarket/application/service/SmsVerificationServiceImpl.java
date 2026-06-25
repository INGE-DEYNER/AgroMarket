package com.agromarket.application.service;

import org.springframework.stereotype.Service;

@Service
public class SmsVerificationServiceImpl implements SmsVerificationService {

    @Override
    public void enviarCodigo(String telefono) {
        throw new UnsupportedOperationException("SMS no configurado");
    }

    @Override
    public boolean verificarCodigo(String telefono, String codigo) {
        throw new UnsupportedOperationException("SMS no configurado");
    }
}
