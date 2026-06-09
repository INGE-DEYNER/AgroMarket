package com.agromarket.interfaces.rest.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
public class HealthController {

    @Autowired
    DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("timestamp", Instant.now().toString());
        try (var conn = dataSource.getConnection()) {
            conn.createStatement().executeQuery("SELECT 1");
            status.put("database", "UP");
            status.put("db_product", conn.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("db_error", e.getMessage());
            return ResponseEntity.status(503).body(status);
        }
        return ResponseEntity.ok(status);
    }
}
