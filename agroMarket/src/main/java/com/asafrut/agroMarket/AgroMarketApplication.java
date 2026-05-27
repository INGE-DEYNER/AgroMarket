package com.asafrut.agroMarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.agromarket")
@EntityScan(basePackages = "com.agromarket.infrastructure.persistence.entity")
@EnableJpaRepositories(basePackages = "com.agromarket.infrastructure.persistence.repository")
public class AgroMarketApplication {

	public static void main(String[] args) {
		SpringApplication.run(AgroMarketApplication.class, args);
	}

}
