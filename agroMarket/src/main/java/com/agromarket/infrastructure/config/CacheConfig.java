
package com.agromarket.infrastructure.config;

import java.time.Duration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PRODUCT_CATALOG_CACHE = "productCatalog";

    @Bean
    public Caffeine<Object, Object> caffeine() {
        return Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(
                        Duration.ofMinutes(10));
    }

    @Bean
    public CacheManager cacheManager(
            Caffeine<Object, Object> caffeine) {

        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                PRODUCT_CATALOG_CACHE);

        cacheManager.setCaffeine(caffeine);

        return cacheManager;
    }
}