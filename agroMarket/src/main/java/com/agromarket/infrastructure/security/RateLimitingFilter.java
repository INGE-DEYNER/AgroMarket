package com.agromarket.infrastructure.security;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitingFilter
                extends OncePerRequestFilter {

        private final RateLimitingService rateLimitingService;

        public RateLimitingFilter(
                        RateLimitingService rateLimitingService) {

                this.rateLimitingService = rateLimitingService;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String clientKey = resolveClientKey(request);

                boolean allowed = rateLimitingService
                                .isAllowed(clientKey);

                int remaining = rateLimitingService
                                .remaining(clientKey);

                response.setHeader(
                                "X-RateLimit-Remaining",
                                String.valueOf(remaining));

                if (!allowed) {

                        response.setStatus(
                                        429);

                        response.setContentType(
                                        MediaType.APPLICATION_JSON_VALUE);

                        response.setHeader(
                                        "Retry-After",
                                        "60");

                        response.getWriter().write(
                                        """
                                                        {"status":429,"error":"Too Many Requests","message":"Demasiadas solicitudes"}
                                                        """);

                        return;
                }

                filterChain.doFilter(
                                request,
                                response);
        }

        private String resolveClientKey(
                        HttpServletRequest request) {

                String forwarded = request.getHeader(
                                "X-Forwarded-For");

                if (forwarded != null
                                && !forwarded.isBlank()) {

                        return forwarded
                                        .split(",")[0]
                                        .trim();
                }

                return request.getRemoteAddr();
        }
}