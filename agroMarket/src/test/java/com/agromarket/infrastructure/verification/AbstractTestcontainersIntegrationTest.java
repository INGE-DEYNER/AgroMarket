// src/test/java/com/agromarket/infrastructure/verification/AbstractTestcontainersIntegrationTest.java
package com.agromarket.infrastructure.verification;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

public abstract class AbstractTestcontainersIntegrationTest {

    protected static final String JWT_SECRET = "test-secret-that-is-long-enough-for-hmac-sha256-agromarket-2026-123456";

    @DynamicPropertySource
    static void registerContainerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:agromarket_test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false;MODE=MySQL;NON_KEYWORDS=VALUE");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
        registry.add("spring.data.mongodb.uri", () -> "mongodb://localhost:27017/agromarket_test");
        registry.add("spring.data.mongodb.auto-index-creation", () -> "true");
        registry.add("app.jwt.secret", () -> JWT_SECRET);
        registry.add("app.jwt.expiration-ms", () -> "3600000");
        registry.add("app.jwt.temporary-expiration-ms", () -> "300000");
        registry.add("app.security.id-encryption-key",
                () -> "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=");
        registry.add("app.cors.allowed-origins", () -> "http://localhost:5173");
        registry.add("app.google.client-id", () -> "test-google-client");
        registry.add("app.google.client-secret", () -> "test-google-secret");
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-secret");
        registry.add("app.google.redirect-uri", () -> "http://localhost:8080/login/oauth2/code/google");
        registry.add("brevo.api.key", () -> "test-brevo-key");
        registry.add("brevo.sender.email", () -> "test@agromarket.local");
        registry.add("brevo.sender.name", () -> "AgroMarket Test");
        registry.add("cloudinary.cloud-name", () -> "test-cloud");
        registry.add("cloudinary.api-key", () -> "test-key");
        registry.add("cloudinary.api-secret", () -> "test-secret");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.jpa.show-sql", () -> "false");
        registry.add("app.scheduler.promotions-delay-ms", () -> "3600000");
        registry.add("app.scheduler.rfq-delay-ms", () -> "3600000");
    }
}
