package com.agromarket.domain.ports;

public interface RateLimiterService {
    /**
     * Intenta adquirir un permiso para la clave. Devuelve true si permitido.
     */
    boolean tryAcquire(String key);
}
