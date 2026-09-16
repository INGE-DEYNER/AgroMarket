package com.agromarket.infrastructure.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

/**
 * Propiedades de configuración de Cloudinary para el almacenamiento de archivos.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {

    /**
     * Nombre de la nube en Cloudinary.
     */
    private String cloudName;

    /**
     * Clave API de Cloudinary.
     */
    private String apiKey;

    /**
     * Secreto de la API de Cloudinary.
     */
    private String apiSecret;
}