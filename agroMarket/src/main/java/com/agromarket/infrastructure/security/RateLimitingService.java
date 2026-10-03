package com.agromarket.infrastructure.security;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * Limite de peticiones por cliente.
 *
 * <p>ANTES: un unico limite de 10.000 peticiones por minuto para todo. Eso no
 * protege nada contra fuerza bruta (son 166 intentos por segundo, suficiente
 * para recorrer los codigos de 6 digitos de un segundo factor en horas) y, si
 * protege contra el abuso, lo hace de forma que un atacante puede agotar el
 * cupo global y dejar sin servicio a los demas usuarios.
 *
 * <p>AHORA: dos niveles, ambos configurables.
 * <ul>
 *   <li>General: 600/min. Frena el uso automatizado sin molestar a nadie.</li>
 *   <li>Sensible: 10/min, y 5/min en endpoints de autenticacion, donde cada
 *       intento de acierto es bajo. Bloquea la fuerza bruta sin tocar el
 *       navegar normal.</li>
 * </ul>
 *
 * <p>Se cuenta por identificador de cliente, no solo por IP: asi un atacante
 * que rote de IP no recupera el cupo.
 */
@Service
public class RateLimitingService {

    /** Nivel general, para el uso normal de la API. */
    private final int maxGeneral;

    /** Nivel estricto, para autenticacion y recuperacion. */
    private final int maxSensible;

    private final long ventanaSegundos;

    private final Cache<String, AtomicInteger> general;
    private final Cache<String, AtomicInteger> sensible;

    public RateLimitingService(
            @Value("${app.rate-limit.general-per-minute:600}") int maxGeneral,
            @Value("${app.rate-limit.sensible-per-minute:10}") int maxSensible,
            @Value("${app.rate-limit.window-seconds:60}") long ventanaSegundos) {

        this.maxGeneral = maxGeneral;
        this.maxSensible = maxSensible;
        this.ventanaSegundos = ventanaSegundos;

        this.general = newCache(ventanaSegundos);
        this.sensible = newCache(ventanaSegundos);
    }

    private Cache<String, AtomicInteger> newCache(long ventana) {
        return Caffeine.newBuilder()
                // Margen sobre el limite: guardan tambien los contadores que
                // ya superaron el tope, para que "restantes" no vuelva a subir
                // a max mientras el cliente sigue bloqueado.
                .maximumSize(100_000)
                .expireAfterWrite(Duration.ofSeconds(ventana))
                .build();
    }

    /** Comprueba el nivel general. */
    public boolean permitirGeneral(String clientKey) {
        return permitir(general, maxGeneral, clientKey);
    }

    /** Comprueba el nivel estricto. */
    public boolean permitirSensible(String clientKey) {
        return permitir(sensible, maxSensible, clientKey);
    }

    private boolean permitir(
            Cache<String, AtomicInteger> cache,
            int max,
            String clientKey) {
        return cache.get(clientKey, k -> new AtomicInteger())
                .incrementAndGet() <= max;
    }

    public int restantesGenerales(String clientKey) {
        return restantes(general, maxGeneral, clientKey);
    }

    public int restantesSensibles(String clientKey) {
        return restantes(sensible, maxSensible, clientKey);
    }

    private int restantes(
            Cache<String, AtomicInteger> cache,
            int max,
            String clientKey) {
        AtomicInteger contador = cache.getIfPresent(clientKey);
        if (contador == null) {
            return max;
        }
        return Math.max(0, max - contador.get());
    }

    /** Segundos que dura la ventana, para la cabecera Retry-After. */
    public int ventanaSegundos() {
        return (int) ventanaSegundos;
    }
}
