package com.agromarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the AgroMarket bounded context.
 *
 * Entity scanning and repository activation (JPA + Mongo) are declared in
 * {@link com.agromarket.infrastructure.config.JpaConfig} and
 * {@link com.agromarket.infrastructure.config.MongoConfig}, which already
 * point at the real package
 * ("com.agromarket.application.adapters.persistence.sql/mongodb").
 * They were previously duplicated here with wrong, non-existent packages
 * ("com.agromarket.infrastructure.persistence.sql/mongo"), which prevented
 * Spring from finding any repository or entity and broke application startup.
 */
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.agromarket.infrastructure.config.properties")
@EnableScheduling
@EnableCaching
@EnableAsync
public class AgroMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgroMarketApplication.class, args);
    }
}
