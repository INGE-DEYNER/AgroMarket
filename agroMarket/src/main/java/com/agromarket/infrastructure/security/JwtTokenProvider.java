// infrastructure/security/JwtTokenProvider.java
package com.agromarket.infrastructure.security;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.agromarket.domain.ports.out.user.AuthenticationTokenPort;

@Component
public class JwtTokenProvider {

    private final AuthenticationTokenPort authenticationTokenPort;

    public JwtTokenProvider(
            AuthenticationTokenPort authenticationTokenPort) {

        this.authenticationTokenPort = authenticationTokenPort;
    }

    public Optional<Long> extractUserId(
            String token) {

        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            return authenticationTokenPort.validate(token);
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    public Optional<String> extractRole(
            String token) {

        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        try {
            return authenticationTokenPort.extractRole(token);
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    public boolean validateToken(
            String token) {

        return extractUserId(token).isPresent();
    }
}