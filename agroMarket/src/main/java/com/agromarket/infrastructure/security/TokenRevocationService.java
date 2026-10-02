package com.agromarket.infrastructure.security;

import java.time.Duration;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * Tokens revocados al cerrar sesion.
 *
 * <p>Un JWT es sin estado: el backend solo comprueba la firma y la fecha, asi
 * que cerrar sesion en el navegador no invalida nada. El token seguia
 * sirviendo hasta una hora despues, y el propio codigo lo reconocia
 * ("el JWT es sin estado, no hay lista de revocacion que consultar"). Eso
 * importa cuando el token se copia del almacenamiento del navegador: cerrar
 * sesion en un equipo no protege ese otro equipo.
 *
 * <p>La revocacion es por {@code jti}, el identificador unico que lleva cada
 * token. Se guardan solo los revocados y caducan cuando el token habria
 * expirado: guardar mas no sirve de nada.
 *
 * <p>Limitacion consciente: la lista vive en memoria, asi que al reiniciar el
 * servidor se pierde. Un token ya revocado volveria a valer hasta su
 * expiracion. Se acepta porque el alcance es la vida del token (1 hora) y la
 * alternativa (tabla de revocaciones) no aporta en un unico servidor. Con
 * varias instancias habria que compartir el almacen.
 */
@Service
public class TokenRevocationService {

    private final Cache<String, Boolean> revocados;
    private final Duration vidaMaxima;

    public TokenRevocationService(
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs) {
        this.vidaMaxima = Duration.ofMillis(Math.max(expirationMs, 60_000L));
        this.revocados = Caffeine.newBuilder()
                .maximumSize(50_000)
                // Cuando el token habria expirado, la entrada sobra.
                .expireAfterWrite(vidaMaxima)
                .build();
    }

    /** Marca un token como revocado. Si no trae jti, no se puede revocar. */
    public void revocar(String token) {
        Optional<String> jti = extraerJti(token);
        if (jti.isEmpty()) {
            // Tokens antiguos, generados sin jti: no hay identificador que
            // guardar. Se avisa para que quede constancia al revisar logs.
            System.err.println("[seguridad] logout de un token sin jti: "
                    + "no se puede revocar hasta que expire.");
            return;
        }
        revocados.put(jti.get(), Boolean.TRUE);
    }

    /** true si el token fue revocado. */
    public boolean estaRevocado(String token) {
        return extraerJti(token)
                .map(revocados::getIfPresent)
                .map(Boolean::booleanValue)
                .orElse(false);
    }

    private Optional<String> extraerJti(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        // El jti es el identificador unico del token (claim "jti" del JWT).
        // No se valida la firma aqui: JwtTokenProvider ya lo hizo antes de
        // llegar a este punto, y un jti inventado solo haria que se rechace
        // un token que ya era invalido.
        int primerPunto = token.indexOf('.');
        int ultimoPunto = token.lastIndexOf('.');
        if (primerPunto < 0 || ultimoPunto <= primerPunto) {
            return Optional.empty();
        }
        try {
            String payload = new String(
                    java.util.Base64.getUrlDecoder().decode(
                            token.substring(primerPunto + 1, ultimoPunto)),
                    java.nio.charset.StandardCharsets.UTF_8);
            int indice = payload.indexOf("\"jti\"");
            if (indice < 0) {
                return Optional.empty();
            }
            int inicio = payload.indexOf(':', indice);
            int fin = payload.indexOf('"', payload.indexOf('"', inicio) + 1);
            if (inicio < 0 || fin <= inicio) {
                return Optional.empty();
            }
            String jti = payload.substring(payload.indexOf('"', inicio) + 1, fin);
            return jti.isBlank() ? Optional.empty() : Optional.of(jti);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}