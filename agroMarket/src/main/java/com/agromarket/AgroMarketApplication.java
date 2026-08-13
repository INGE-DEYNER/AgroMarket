package com.agromarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Entry point for the AgroMarket bounded context. */
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.agromarket.infrastructure.config.properties")
@EntityScan(basePackages = {
        "com.agromarket.infrastructure.persistence.sql.entities",
        "com.agromarket.infrastructure.persistence.mongo.documents"
})
@EnableJpaRepositories(basePackages = "com.agromarket.infrastructure.persistence.sql.repositories")
@EnableMongoRepositories(basePackages = "com.agromarket.infrastructure.persistence.mongo.repositories")
@EnableScheduling
@EnableCaching
@EnableAsync
public class AgroMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgroMarketApplication.class, args);
    }
}
