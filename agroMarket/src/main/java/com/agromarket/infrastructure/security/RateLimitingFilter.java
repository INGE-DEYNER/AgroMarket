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
                boolean sensible = esRutaSensible(request);

                boolean allowed = sensible
                                ? rateLimitingService.permitirSensible(clientKey)
                                : rateLimitingService.permitirGeneral(clientKey);

                int remaining = sensible
                                ? rateLimitingService.restantesSensibles(clientKey)
                                : rateLimitingService.restantesGenerales(clientKey);

                response.setHeader(
                                "X-RateLimit-Remaining",
                                String.valueOf(remaining));

                response.setHeader(
                                "X-RateLimit-Limit",
                                sensible ? "sensible" : "general");

                if (!allowed) {

                        response.setStatus(
                                        429);

                        response.setContentType(
                                        MediaType.APPLICATION_JSON_VALUE);

                        response.setHeader(
                                        "Retry-After",
                                        String.valueOf(
                                                        rateLimitingService.ventanaSegundos()));

                        response.getWriter().write(
                                        """
                                                        {"status":429,"error":"Too Many Requests","message":"Demasiadas solicitudes. Espera un momento e intentalo de nuevo."}
                                                        """);

                        return;
                }

                filterChain.doFilter(
                                request,
                                response);
        }

        /**
         * Rutas donde un intento de mas tiene un coste alto para el atacante.
         *
         * <p>Todas van por el nivel estricto (10/min) en vez del general
         * (600/min). Con el limite general, un atacante hacia 166 intentos por
         * segundo: suficiente para recorrer los 6 digitos de un segundo factor
         * en cuestion de horas.
         *
         * <p>Se comparan los ultimos segmentos de la ruta porque la aplicacion
         * sirve alias: el mismo login llega como /api/v1/auth/login y como
         * /api/auth/login.
         */
        private boolean esRutaSensible(HttpServletRequest request) {
                String ruta = request.getRequestURI();
                if (ruta == null) {
                        return false;
                }
                String minusculas = ruta.toLowerCase();

                return minusculas.contains("/auth/login")
                                || minusculas.contains("/auth/registro")
                                || minusculas.contains("/auth/register")
                                || minusculas.contains("/auth/recuperar")
                                || minusculas.contains("/auth/restablecer")
                                || minusculas.contains("/auth/reset")
                                || minusculas.contains("/auth/verificar")
                                || minusculas.contains("/auth/totp")
                                || minusculas.contains("/auth/2fa")
                                || minusculas.contains("/auth/logout")
                                || minusculas.contains("/auth/refresh")
                                || minusculas.contains("/auth/2fa/setup")
                                || minusculas.contains("/2fa/")
                                || minusculas.contains("/pagos/")
                                || minusculas.endsWith("/images")
                                || minusculas.contains("/images/upload")
                                || minusculas.contains("/mensajes/tickets")
                                /*
                                 * Reporte de soporte: ruta PUBLICA y sin sesion.
                                 * Si no fuera sensible, 600/min por IP darian
                                 * 10 reports por segundo, cada uno con un
                                 * correo al buzon de soporte. Con el nivel
                                 * estricto (10/min) el abuse se frena igual
                                 * que en el login, y ningun usuario real llega
                                 * a escribir 10 problemas en un minuto.
                                 */
                                || minusculas.contains("/soporte/reportes");
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