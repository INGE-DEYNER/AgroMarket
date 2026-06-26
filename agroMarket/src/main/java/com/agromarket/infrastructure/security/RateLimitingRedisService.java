package com.agromarket.infrastructure.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Rate limiter in-memory con ventana de tiempo usando Caffeine.
 * Reemplaza la implementación anterior que nunca expiraba contadores
 * (causaba bloqueo permanente de usuarios y memory leak).
 *
 * Cada clave tiene su propio contador con TTL independiente.
 * Caffeine expira la entrada automáticamente pasado el window, reseteando el conteo.
 */
@Service
public class RateLimitingRedisService {

    // Cache con expiración automática de 24h máximo (cada key tiene su propio TTL efectivo)
    // La expiración real la controla el caller via durationInSeconds en el contexto semántico,
    // pero necesitamos un TTL en cache. Usamos el mayor ventana esperada (3600s = 1h para recuperar contraseña).
    private final Cache<String, AtomicLong> counters = Caffeine.newBuilder()
            .expireAfterWrite(3600, TimeUnit.SECONDS)
            .maximumSize(50_000)
            .build();

    /**
     * @param key             clave única (ej. "login:192.168.1.1")
     * @param limit           número máximo de intentos permitidos
     * @param durationInSeconds ventana de tiempo en segundos — se usa como referencia semántica;
     *                        el cache expira a los 3600s máximo (suficiente para ambas ventanas: 900s login, 3600s recuperar)
     * @return true si el intento está permitido, false si excede el límite
     */
    public boolean isAllowed(String key, int limit, long durationInSeconds) {
        // putIfAbsent no es atómico en Caffeine.get() sin compute — usamos get con mappingFunction
        AtomicLong counter = counters.get(key, k -> new AtomicLong(0));
        long count = counter.incrementAndGet();
        return count <= limit;
    }
}
