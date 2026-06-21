package com.asafrut.agroMarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = "com.agromarket")
@ConfigurationPropertiesScan(basePackages = "com.agromarket.config.properties")
@EntityScan(basePackages = "com.agromarket.infrastructure.persistence.entity")
@EnableJpaRepositories(basePackages = "com.agromarket.infrastructure.persistence.repository")
@EnableScheduling
@EnableCaching
@org.springframework.scheduling.annotation.EnableAsync
public class AgroMarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgroMarketApplication.class, args);
	}

}
