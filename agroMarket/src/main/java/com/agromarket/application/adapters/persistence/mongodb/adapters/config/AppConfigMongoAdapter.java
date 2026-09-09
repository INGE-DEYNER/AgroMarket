package com.agromarket.application.adapters.persistence.mongodb.adapters.config;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.application.adapters.persistence.mongodb.documents.config.AppConfigDocument;
import com.agromarket.application.adapters.persistence.mongodb.repositories.config.AppConfigMongoRepository;
import com.agromarket.domain.ports.out.config.AppConfigPort;

/**
 * Adaptador de configuración dinámica en MongoDB.
 * Claves de configuración conocidas:
 * - costo_envio (AppConfigPort.CLAVE_COSTO_ENVIO): costo de envío nacional
 *   (COP) editable desde el panel Admin.
 */
@Component
public class AppConfigMongoAdapter implements AppConfigPort {

    private final AppConfigMongoRepository repository;

    public AppConfigMongoAdapter(AppConfigMongoRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<BigDecimal> getValor(String clave) {
        if (clave == null || clave.isBlank()) {
            return Optional.empty();
        }
        return repository.findById(clave)
                .map(AppConfigDocument::getValor)
                .filter(valor -> valor != null);
    }

    @Override
    public void setValor(String clave, BigDecimal valor) {
        if (clave == null || clave.isBlank() || valor == null) {
            throw new IllegalArgumentException(
                    "La clave y el valor de configuración son obligatorios");
        }
        repository.save(
                AppConfigDocument.builder().clave(clave).valor(valor).build());
    }
}