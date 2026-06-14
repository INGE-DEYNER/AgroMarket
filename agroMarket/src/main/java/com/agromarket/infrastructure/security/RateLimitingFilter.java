package com.agromarket.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.Refill;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
@SuppressWarnings("deprecation")
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket newBucket(long capacity, Duration period) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(capacity, Refill.greedy(capacity, period)))
                .build();
    }

    private Bucket resolve(String key, long capacity, Duration period) {
        return buckets.computeIfAbsent(key, k -> newBucket(capacity, period));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Only apply to the POST login and recuperar endpoints here; other endpoints may use service-level limiters
        return !("POST".equalsIgnoreCase(request.getMethod()) && ("/api/auth/login".equalsIgnoreCase(path) || "/api/auth/recuperar-contrasena".equalsIgnoreCase(path)));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip = extractClientIp(request);

        if ("/api/auth/login".equalsIgnoreCase(path)) {
            Bucket bucket = resolve("ip:login:" + ip, 5, Duration.ofMinutes(15));
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                long waitForRefillSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000L;
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", String.valueOf(waitForRefillSeconds > 0 ? waitForRefillSeconds : 60));
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Límite de intentos alcanzado. Intenta más tarde.\"}");
                return;
            }
        } else if ("/api/auth/recuperar-contrasena".equalsIgnoreCase(path)) {
            Bucket bucket = resolve("ip:recup:" + ip, 3, Duration.ofHours(1));
            ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
            if (!probe.isConsumed()) {
                long waitForRefillSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000L;
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", String.valueOf(waitForRefillSeconds > 0 ? waitForRefillSeconds : 300));
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Límite de solicitudes alcanzado. Intenta más tarde.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
