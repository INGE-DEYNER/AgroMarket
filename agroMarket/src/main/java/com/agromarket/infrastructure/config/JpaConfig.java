package com.agromarket.infrastructure.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.agromarket.application.adapters.persistence.sql")
@EntityScan(basePackages = "com.agromarket.application.adapters.persistence.sql")
public class JpaConfig {
}
