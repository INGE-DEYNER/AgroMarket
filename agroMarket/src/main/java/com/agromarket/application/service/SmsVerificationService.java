package com.agromarket.application.service;

public interface SmsVerificationService {
    void enviarCodigo(String telefono);
    boolean verificarCodigo(String telefono, String codigo);
}
