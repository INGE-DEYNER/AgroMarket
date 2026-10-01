package com.agromarket.infrastructure.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.agromarket.infrastructure.config.properties.AppProperties;
import com.agromarket.infrastructure.config.properties.JwtProperties;

/**
 * Comprobaciones de arranque sobre los secretos de la aplicación.
 *
 * <p>No bloquean el arranque en desarrollo: con un {@code JWT_SECRET} de ejemplo
 * se puede trabajar en local. En producción ({@code SPRING_PROFILES_ACTIVE=prod})
 * sí cortan, porque arrancar con una clave de firma conocida equivale a no
 * tener autenticación: cualquiera que lea el repositorio podría firmar un
 * token con {@code role=ADMIN}.
 */
@Component
public class SecretosStartupValidator {

    private static final String PERFIL_PRODUCCION = "prod";

    private final JwtProperties jwtProperties;
    private final Environment environment;

    public SecretosStartupValidator(
            JwtProperties jwtProperties,
            Environment environment) {
        this.jwtProperties = jwtProperties;
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verificar() {
        boolean produccion = PERFIL_PRODUCCION.equalsIgnoreCase(
                environment.getProperty("spring.profiles.active", "dev"));

        if (produccion) {
            // En producción no hay excepción: si la clave sirve para firmar
            // cualquier token, no se sirve de nada tener autenticación.
            jwtProperties.validar();
            return;
        }

        // En desarrollo se avisa, pero no se para: si se parara, nadie podría
        // levantar el proyecto sin generar las variables primero.
        try {
            jwtProperties.validar();
        } catch (IllegalStateException ex) {
            System.err.println();
            System.err.println("  [AVISO DE SEGURIDAD] " + ex.getMessage());
            System.err.println("  [AVISO DE SEGURIDAD] La aplicación arranca en "
                    + "desarrollo, pero con esta clave cualquier persona puede "
                    + "firmar un token con role=ADMIN.");
            System.err.println("  [AVISO DE SEGURIDAD] Antes de publicar en "
                    + "producción, define JWT_SECRET en el entorno.");
            System.err.println();
        }
    }
}