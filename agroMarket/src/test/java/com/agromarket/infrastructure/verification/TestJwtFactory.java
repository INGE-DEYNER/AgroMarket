// src/test/java/com/agromarket/infrastructure/verification/TestJwtFactory.java
package com.agromarket.infrastructure.verification;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import com.agromarket.infrastructure.config.properties.JwtProperties;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/** Crea JWT de prueba con exactamente los claims que usa SecurityConfig/JwtAuthenticationFilter. */
public final class TestJwtFactory {

    private final JwtProperties properties;

    public TestJwtFactory(JwtProperties properties) {
        this.properties = properties;
    }

    public String token(Long userId, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(properties.getExpirationMs())))
                .signWith(Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}
