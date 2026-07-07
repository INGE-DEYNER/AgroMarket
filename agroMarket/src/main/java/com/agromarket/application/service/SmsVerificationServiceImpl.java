package com.agromarket.application.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmsVerificationServiceImpl implements SmsVerificationService {

    private final Map<String, CodigoDemo> codigosDemo = new ConcurrentHashMap<>();

    public static class CodigoDemo {
        private final String codigo;
        private final LocalDateTime expira;

        public CodigoDemo(String codigo, LocalDateTime expira) {
            this.codigo = codigo;
            this.expira = expira;
        }

        public String getCodigo() {
            return codigo;
        }

        public LocalDateTime getExpira() {
            return expira;
        }
    }

    @Override
    public void enviarCodigo(String telefono) {
        // Guarda código "123456" en ConcurrentHashMap con TTL 5 minutos
        codigosDemo.put(telefono, new CodigoDemo("123456", LocalDateTime.now().plusMinutes(5)));
        log.info("SMS demo: código 123456 para {}", telefono);
    }

    @Override
    public boolean verificarCodigo(String telefono, String codigo) {
        // Acepta cualquier código de 6 dígitos numéricos
        return codigo != null && codigo.matches("^\\d{6}$");
    }
}
