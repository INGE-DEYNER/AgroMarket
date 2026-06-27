package com.agromarket.interfaces.rest.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final javax.sql.DataSource dataSource;
    private final com.github.benmanes.caffeine.cache.Cache<Long, Object> productoCache;

    @org.springframework.beans.factory.annotation.Value("${brevo.api-key:mock-key}")
    private String brevoApiKey;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());

        // 1. Database Health
        try (var conn = dataSource.getConnection()) {
            conn.createStatement().executeQuery("SELECT 1");
            status.put("database", "UP");
            status.put("db_product", conn.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("db_error", e.getMessage());
            status.put("status", "DOWN");
        }

        // 2. Caffeine Cache Health
        try {
            long cacheSize = productoCache.estimatedSize();
            status.put("cache", "UP");
            status.put("cache_size_estimated", cacheSize);
        } catch (Exception e) {
            status.put("cache", "DOWN");
            status.put("cache_error", e.getMessage());
            status.put("status", "DOWN");
        }

        // 3. Brevo Mail Service Config Check
        if (brevoApiKey == null || brevoApiKey.isBlank() || "mock-key".equalsIgnoreCase(brevoApiKey)) {
            status.put("mail_service", "MOCK_MODE");
        } else {
            status.put("mail_service", "CONFIGURED");
        }

        if ("DOWN".equals(status.get("status"))) {
            return ResponseEntity.status(503).body(status);
        }
        return ResponseEntity.ok(status);
    }
}
