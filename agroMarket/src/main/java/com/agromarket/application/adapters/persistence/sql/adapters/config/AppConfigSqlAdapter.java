package com.agromarket.application.adapters.persistence.sql.adapters.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.application.adapters.persistence.sql.entities.config.AppConfigEntity;
import com.agromarket.application.adapters.persistence.sql.repositories.config.AppConfigJpaRepository;
import com.agromarket.domain.ports.out.config.AppConfigPort;

/**
 * Adaptador de configuración dinámica en MySQL (reemplaza a AppConfigMongoAdapter).
 * Claves de configuración conocidas:
 * - costo_envio (AppConfigPort.CLAVE_COSTO_ENVIO): costo de envío nacional
 *   (COP) editable desde el panel Admin.
 * - modo_mantenimiento (AppConfigPort.CLAVE_MODO_MANTENIMIENTO).
 */
@Component
@Profile("sql")
@Transactional
public class AppConfigSqlAdapter implements AppConfigPort {

    private final AppConfigJpaRepository repository;

    public AppConfigSqlAdapter(AppConfigJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BigDecimal> getValor(String clave) {
        if (clave == null || clave.isBlank()) {
            return Optional.empty();
        }
        return repository.findById(clave)
                .map(AppConfigEntity::getValor)
                .filter(valor -> valor != null);
    }

    @Override
    public void setValor(String clave, BigDecimal valor) {
        if (clave == null || clave.isBlank() || valor == null) {
            throw new IllegalArgumentException(
                    "La clave y el valor de configuración son obligatorios");
        }
        AppConfigEntity entity = repository.findById(clave)
                .orElseGet(() -> AppConfigEntity.builder()
                        .clave(clave)
                        .build());
        entity.setValor(valor);
        entity.setUpdatedAt(LocalDateTime.now());
        repository.save(entity);
    }
}
