package com.agromarket.domain.ports;

public interface SmsVerificationService {
    void enviarCodigo(String telefono);
    boolean verificarCodigo(String telefono, String codigo);
}
