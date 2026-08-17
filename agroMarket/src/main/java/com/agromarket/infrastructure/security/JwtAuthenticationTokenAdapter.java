package com.agromarket.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.out.user.AuthenticationTokenPort;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtAuthenticationTokenAdapter
                implements AuthenticationTokenPort {

        private static final String ROLE_CLAIM = "role";
        private static final String TYPE_CLAIM = "type";
        private static final String TEMPORARY_TYPE = "2fa";

        private final SecretKey signingKey;
        private final long expirationMs;
        private final long temporaryExpirationMs;

        public JwtAuthenticationTokenAdapter(
                        @Value("${app.jwt.secret}") String secret,
                        @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
                        @Value("${app.jwt.temporary-expiration-ms:300000}") long temporaryExpirationMs) {

                if (secret == null || secret.isBlank()) {
                        throw new IllegalStateException(
                                        "app.jwt.secret es obligatorio");
                }

                byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);

                if (secretBytes.length < 32) {
                        throw new IllegalStateException(
                                        "app.jwt.secret debe tener al menos 32 bytes");
                }

                this.signingKey = Keys.hmacShaKeyFor(secretBytes);

                this.expirationMs = expirationMs;
                this.temporaryExpirationMs = temporaryExpirationMs;
        }

        @Override
        public String generate(User user) {
                return generateToken(
                                user,
                                expirationMs,
                                false);
        }

        @Override
        public String generateTemporary(User user) {
                return generateToken(
                                user,
                                temporaryExpirationMs,
                                true);
        }

        @Override
        public Optional<Long> validate(
                        String token) {

                try {
                        Claims claims = parseClaims(token);

                        String subject = claims.getSubject();

                        if (subject == null
                                        || subject.isBlank()) {
                                return Optional.empty();
                        }

                        return Optional.of(
                                        Long.parseLong(subject));

                } catch (JwtException
                                | IllegalArgumentException ex) {

                        return Optional.empty();
                }
        }

        @Override
        public Optional<String> extractRole(
                        String token) {

                try {
                        Claims claims = parseClaims(token);

                        return Optional.ofNullable(
                                        claims.get(
                                                        ROLE_CLAIM,
                                                        String.class));

                } catch (JwtException
                                | IllegalArgumentException ex) {

                        return Optional.empty();
                }
        }

        private Claims parseClaims(
                        String token) {

                if (token == null
                                || token.isBlank()) {
                        throw new IllegalArgumentException(
                                        "JWT vacío");
                }

                return Jwts.parser()
                                .verifyWith(signingKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload();
        }

        private String generateToken(
                        User user,
                        long lifetimeMs,
                        boolean temporary) {

                if (user == null
                                || user.getId() == null) {
                        throw new IllegalArgumentException(
                                        "El usuario y su id son obligatorios");
                }

                Date issuedAt = new Date();

                Date expiration = new Date(
                                issuedAt.getTime()
                                                + lifetimeMs);

                return Jwts.builder()
                                .subject(
                                                String.valueOf(
                                                                user.getId()))
                                .claim(
                                                ROLE_CLAIM,
                                                user.getRole() == null
                                                                ? null
                                                                : user.getRole().name())
                                .claim(
                                                TYPE_CLAIM,
                                                temporary
                                                                ? TEMPORARY_TYPE
                                                                : "access")
                                .issuedAt(issuedAt)
                                .expiration(expiration)
                                .signWith(signingKey)
                                .compact();
        }
}