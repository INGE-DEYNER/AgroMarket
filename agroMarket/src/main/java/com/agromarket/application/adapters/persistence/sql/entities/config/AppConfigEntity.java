package com.agromarket.application.adapters.persistence.sql.entities.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad JPA de configuración dinámica de la aplicación.
 * Reemplaza la antigua colección Mongo "app_config":
 * ahora la configuración crítica vive en MySQL.
 */
@Entity
@Table(name = "app_config")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppConfigEntity {

    /** Clave de configuración (PK). Ej.: costo_envio, modo_mantenimiento. */
    @Id
    @Column(name = "clave", length = 100)
    private String clave;

    @Column(name = "valor", precision = 19, scale = 4)
    private BigDecimal valor;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
