package com.agromarket.infrastructure.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /**
     * Secreto utilizado para firmar los JWT.
     * Debe proporcionarse mediante variable de entorno o secret manager.
     */
    private String secret;

    /**
     * Tiempo de vida del JWT de acceso en milisegundos.
     */
    private long expirationMs = 3_600_000L;
}