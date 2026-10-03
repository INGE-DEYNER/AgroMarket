package com.agromarket.infrastructure.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
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
 * <h2>Por que esta en la base y no solo en memoria</h2>
 *
 * <p>La primera version era una Caffeine en memoria, con dos fallos que solo
 * aparecen al reiniciar o al haber mas de una instancia:
 * <ul>
 *   <li>Al reiniciar se perdia la lista, y un token ya revocado volvia a
 *       valer hasta una hora.</li>
 *   <li>Con dos instancias, revocar en la A no hacia nada en la B: el mismo
 *       token seguia valiendo ahi.</li>
 * </ul>
 *
 * <p>Ahora la tabla {@code revoked_tokens} es la verdad y la cache va delante.
 * La cache no abre una ventana de seguridad: la revocacion se escribe en la
 * base ANTES de responder al logout, y solo se cachean los tokens que se han
 * visto VALIDOS, unos segundos. Un token revocado puede como mucho aceptarse
 * durante ese intervalo, y ningun reinicio lo resucita.
 *
 * <p>Se mantiene la cache porque la comprobacion ocurre en CADA peticion
 * autenticada: sin ella, cada una seria un viaje a MySQL.
 */
@Service
public class TokenRevocationService {

    private static final String SQL_INSERT =
            "INSERT INTO revoked_tokens (jti, revoked_at, expires_at) "
                    + "VALUES (?, ?, ?) "
                    + "ON DUPLICATE KEY UPDATE revoked_at = VALUES(revoked_at)";

    private static final String SQL_EXISTS =
            "SELECT 1 FROM revoked_tokens WHERE jti = ? LIMIT 1";

    private static final String SQL_PURGA =
            "DELETE FROM revoked_tokens WHERE expires_at < ?";

    private final JdbcTemplate jdbc;

    /**
     * Tokens que se han visto VALIDOS, no revocaciones. Se cachean para no ir
     * a la base en cada peticion. Al revocar se limpia la entrada, de modo
     * que un token revocado nunca queda oculto por la cache.
     */
    private final Cache<String, Boolean> validosCache;

    private final Duration vidaMaxima;
    private final Duration ventanaCache;

    /**
     * UN solo constructor a proposito.
     *
     * <p>Habia dos: el de Spring y otro de pruebas que fijaba el tamaño de la
     * cache. Con dos, Spring no sabe cual usar y falla al arrancar con
     * "No default constructor found": el error no señalaba que el problema era
     * el constructor, sino que buscaba uno por defecto que no existia.
     *
     * <p>Con uno solo, Spring lo usa sin ambiguedad. Para los tests,
     * {@link #paraPruebas} construye la instancia directamente.
     */
    public TokenRevocationService(
            JdbcTemplate jdbc,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
            @Value("${app.jwt.revocation-cache-ms:10000}") long cacheMillis) {
        this.jdbc = jdbc;
        this.vidaMaxima = Duration.ofMillis(Math.max(expirationMs, 60_000L));
        this.ventanaCache = Duration.ofMillis(Math.max(cacheMillis, 0L));
        this.validosCache = Caffeine.newBuilder()
                .maximumSize(50_000)
                .expireAfterWrite(this.ventanaCache)
                .build();
    }

    /**
     * Para los tests: instancia con la ventana de cache que se le pase.
     * No lo usa Spring, solo las pruebas.
     */
    public static TokenRevocationService paraPruebas(
            JdbcTemplate jdbc,
            long expirationMs,
            long cacheMillis) {
        return new TokenRevocationService(jdbc, expirationMs, cacheMillis);
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
        Instant ahora = Instant.now();
        jdbc.update(SQL_INSERT,
                jti.get(),
                java.sql.Timestamp.from(ahora),
                // El token dejaria de valer igualmente en su expiracion: guardar
                // mas alla no aporta nada y solo engorda la tabla.
                java.sql.Timestamp.from(ahora.plus(vidaMaxima)));
        // Se limpia la cache para que un token ya visto como valido no siga
        // aceptandose.
        validosCache.invalidate(jti.get());
    }

    /** true si el token fue revocado. */
    public boolean estaRevocado(String token) {
        Optional<String> jti = extraerJti(token);
        if (jti.isEmpty()) {
            return false;
        }
        // Solo se cachea el "no revocado". El "si" se consulta siempre en la
        // base, que es la comprobacion que de verdad importa.
        if (validosCache.getIfPresent(jti.get()) != null) {
            return false;
        }
        /*
         * OJO: queryForObject NO sirve aqui. Con un SELECT que no devuelve
         * filas lanza EmptyResultDataAccessException ("expected 1, actual 0")
         * en vez de devolver null, y eso reventaba con un 500 en la primera
         * peticion de cada token. Lo normal es una lista vacia cuando el token
         * no esta revocado, que es el caso MAS frecuente.
         */
        java.util.List<Integer> filas = jdbc.query(
                SQL_EXISTS,
                (rs, i) -> rs.getInt(1),
                jti.get());
        boolean revocado = !filas.isEmpty();
        if (!revocado) {
            validosCache.put(jti.get(), Boolean.TRUE);
        }
        return revocado;
    }

    /**
     * Borra las revocaciones que ya no sirven.
     *
     * <p>Sin esto la tabla crecia sin limite. Se llama cada hora y borra lo que
     * ya habria expirado.
     */
    @Scheduled(fixedDelayString = "${app.jwt.revocation-purge-ms:3600000}")
    public void purgar() {
        try {
            int borradas = jdbc.update(SQL_PURGA,
                    java.sql.Timestamp.from(Instant.now()));
            if (borradas > 0) {
                System.out.println("[seguridad] purgadas " + borradas
                        + " revocaciones caducadas");
            }
        } catch (Exception ex) {
            // Si la purga falla la tabla crece, pero el sistema sigue
            // funcionando. No se propaga: tumbar por no borrar basura seria
            // peor que la basura.
            System.err.println("[seguridad] no se pudo purgar la tabla de "
                    + "revocaciones: " + ex.getMessage());
        }
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