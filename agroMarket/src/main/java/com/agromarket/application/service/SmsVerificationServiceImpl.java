package com.agromarket.application.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmsVerificationServiceImpl implements SmsVerificationService {

    private final Map<String, String> codigosSimulados = new ConcurrentHashMap<>();

    @Override
    public void enviarCodigo(String telefono) {
        // Simulación: guardar código "123456" en caché local
        log.info("SMS simulado enviado a {}", telefono);
        codigosSimulados.put(telefono, "123456");
    }

    @Override
    public boolean verificarCodigo(String telefono, String codigo) {
        // Acepta cualquier código de 6 dígitos en modo simulación
        return codigo != null && codigo.length() == 6 && codigo.matches("\\d{6}");
    }
}
