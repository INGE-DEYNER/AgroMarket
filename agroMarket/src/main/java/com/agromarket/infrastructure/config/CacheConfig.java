package com.agromarket.infrastructure.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuración centralizada de caché con Caffeine.
 * Utiliza caché en memoria con políticas de expiración automática.
 */
@Configuration
public class CacheConfig {

    /**
     * Caché para productos por ID.
     * Expira después de 10 minutos de inactividad o 30 minutos de acceso máximo.
     */
    @Bean
    public Cache<Long, Object> productoCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .expireAfterAccess(30, TimeUnit.MINUTES)
                .maximumSize(1000)
                .build();
    }

    /**
     * Caché para catálogo completo (listado de todos los productos disponibles).
     * Expira después de 15 minutos para mantener datos relativamente frescos.
     */
    @Bean
    public Cache<String, Object> catalogoCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .maximumSize(100)
                .build();
    }

    /**
     * Caché para productos del productor (mis-productos).
     * La invalidación se realiza automáticamente cuando se crea/actualiza/elimina un producto.
     * Expira después de 5 minutos de inactividad.
     */
    @Bean
    public Cache<Long, Object> misProductosCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(500)
                .build();
    }

    /**
     * Caché para reseñas de productos.
     * Expira después de 20 minutos.
     */
    @Bean
    public Cache<Long, Object> resenaCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(20, TimeUnit.MINUTES)
                .maximumSize(500)
                .build();
    }

    /**
     * Caché para datos de usuario (perfil).
     * Expira después de 30 minutos.
     */
    @Bean
    public Cache<Long, Object> usuarioCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(500)
                .build();
    }

    /**
     * Caché para pedidos del comprador.
     * Expira después de 10 minutos.
     */
    @Bean
    public Cache<Long, Object> pedidosCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .build();
    }

    /**
     * Caché para estadísticas y dashboards.
     * Expira después de 30 minutos.
     */
    @Bean
    public Cache<String, Object> statsCache() {
        return Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .maximumSize(100)
                .build();
    }
}

