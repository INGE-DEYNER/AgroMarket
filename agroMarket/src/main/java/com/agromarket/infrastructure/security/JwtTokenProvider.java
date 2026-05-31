package com.agromarket.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

import com.agromarket.config.properties.AgroMarketJwtProperties;
import com.agromarket.config.properties.JwtProperties;
import com.agromarket.domain.model.RolUsuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@SuppressWarnings("deprecation")
public class JwtTokenProvider {
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtTokenProvider(JwtProperties jwtProperties, AgroMarketJwtProperties agroMarketJwtProperties) {
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = agroMarketJwtProperties.expirationMs();
    }

    public void validateSecretStrength() {
        if (secretKey == null || secretKey.getEncoded() == null || secretKey.getEncoded().length < 64) {
            throw new IllegalStateException("JWT secret is missing or too short. It must be at least 64 bytes for HS512.");
        }
    }

    public String generateToken(String correo, Long userId, RolUsuario rol) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);
        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(correo)
                .claim("rol", rol != null ? rol.name() : null)
                .claim("userId", userId)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(secretKey)
                .compact();
    }

    public String extractCorreo(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object userId = parseClaims(token).get("userId");
        if (userId instanceof Number number) {
            return number.longValue();
        }
        return userId == null ? null : Long.valueOf(userId.toString());
    }

    public RolUsuario extractRol(String token) {
        Object rol = parseClaims(token).get("rol");
        return rol == null ? null : RolUsuario.valueOf(rol.toString());
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            // Try to include remote IP if available, but never log the token itself
            String ip = "unknown";
            try {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest req = attrs.getRequest();
                    if (req != null) ip = req.getRemoteAddr();
                }
            } catch (Exception e) {
                // ignore
            }
            log.warn("Token inválido o expirado - ip={} - reason={}", ip, ex.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Date now = new Date();
            Date iat = claims.getIssuedAt();
            Date exp = claims.getExpiration();

            if (iat == null || exp == null) {
                throw new JwtException("Token missing iat/exp");
            }

            if (now.before(iat) || now.after(exp)) {
                throw new JwtException("Token outside valid time range");
            }

            return claims;
        } catch (JwtException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new JwtException("Invalid token", ex);
        }
    }
}
