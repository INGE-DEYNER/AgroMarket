package com.agromarket.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.agromarket.application.adapters.persistence.mongodb")
public class MongoConfig {
}
