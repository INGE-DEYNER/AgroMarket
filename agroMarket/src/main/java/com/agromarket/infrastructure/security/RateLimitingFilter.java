package com.agromarket.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingRedisService rateLimitingRedisService;

    public RateLimitingFilter(RateLimitingRedisService rateLimitingRedisService) {
        this.rateLimitingRedisService = rateLimitingRedisService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        return !("POST".equalsIgnoreCase(method) && (
            "/api/auth/login".equalsIgnoreCase(path) ||
            "/api/auth/registro".equalsIgnoreCase(path) ||
            "/api/auth/recuperar-contrasena".equalsIgnoreCase(path) ||
            "/api/auth/verify-code".equalsIgnoreCase(path)
        ));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip = extractClientIp(request);

        if ("/api/auth/login".equalsIgnoreCase(path)) {
            boolean allowed = rateLimitingRedisService.isAllowed("login:" + ip, 5, 900);
            if (!allowed) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "900");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Límite de intentos alcanzado. Intenta más tarde.\"}");
                return;
            }
        } else if ("/api/auth/recuperar-contrasena".equalsIgnoreCase(path)) {
            boolean allowed = rateLimitingRedisService.isAllowed("recup:" + ip, 3, 3600);
            if (!allowed) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "3600");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Límite de solicitudes alcanzado. Intenta más tarde.\"}");
                return;
            }
        } else if ("/api/auth/verify-code".equalsIgnoreCase(path)) {
            // 10 intentos por hora para prevenir fuerza bruta sobre códigos de 6 dígitos
            boolean allowed = rateLimitingRedisService.isAllowed("verifycode:" + ip, 10, 3600);
            if (!allowed) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "3600");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Demasiados intentos de verificación. Solicita un nuevo código.\"}");
                return;
            }
        } else if ("/api/auth/registro".equalsIgnoreCase(path)) {
            // 10 intentos por hora para registro
            boolean allowed = rateLimitingRedisService.isAllowed("registro:" + ip, 10, 3600);
            if (!allowed) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setHeader("Retry-After", "3600");
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Límite de registros alcanzado. Intenta más tarde.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            // SECURITY FIX: tomamos la ÚLTIMA IP del chain, no la primera.
            // La primera puede ser falsificada por el cliente. La última es la del proxy más cercano (confiable en Railway).
            String[] ips = xf.split(",");
            return ips[ips.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}
