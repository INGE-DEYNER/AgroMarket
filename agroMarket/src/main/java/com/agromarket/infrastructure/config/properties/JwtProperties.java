package com.agromarket.infrastructure.config.properties;

import java.util.Locale;

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
     * Valores que aparecen como valor por defecto en application.yml o en la
     * documentación. Si la aplicación arranca con uno de ellos, la clave de
     * firma es pública: cualquiera que lea el repositorio puede fabricar un
     * token con role=ADMIN y entrar como administrador.
     */
    private static final String DEFAULT_PLACEHOLDER = "change-me";

    /**
     * Longitud mínima aceptable para una clave HS512. Con menos, la firma se
     * puede adivinar por fuerza bruta sin esfuerzo.
     */
    private static final int MIN_SECRET_LENGTH = 32;

    /**
     * Secreto utilizado para firmar los JWT.
     * Debe proporcionarse mediante variable de entorno o secret manager.
     */
    private String secret;

    /**
     * Tiempo de vida del JWT de acceso en milisegundos.
     */
    private long expirationMs = 3_600_000L;

    /**
     * Tiempo de vida de los JWT temporales en milisegundos.
     */
    private long temporaryExpirationMs = 300_000L;

    /**
     * Comprueba que la clave de firma sea aceptable.
     *
     * @throws IllegalStateException si falta, es corta o es un valor de
     *         ejemplo conocido.
     */
    public void validar() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret no está definido. Sin ella los JWT se "
                            + "firmarían con una clave conocida y cualquier "
                            + "persona podría asumir privilegios de "
                            + "administrador. "
                            + "Genera una con: openssl rand -base64 64");
        }
        if (secret.trim().toLowerCase(Locale.ROOT).equals(DEFAULT_PLACEHOLDER)
                || secret.trim().equalsIgnoreCase("secret")
                || secret.trim().equalsIgnoreCase("cambia-este-valor-por-uno-seguro")) {
            throw new IllegalStateException(
                    "app.jwt.secret tiene el valor de ejemplo \"" + secret
                            + "\". Con esa clave cualquiera puede firmar un token "
                            + "con role=ADMIN. Genera una real con: "
                            + "openssl rand -base64 64");
        }
        if (secret.trim().length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "app.jwt.secret es demasiado corta (" + secret.trim().length()
                            + " caracteres). Se requieren al menos "
                            + MIN_SECRET_LENGTH + " para HS512. "
                            + "Genera una con: openssl rand -base64 64");
        }
    }
}