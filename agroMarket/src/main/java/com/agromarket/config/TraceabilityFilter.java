package com.agromarket.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.agromarket.infrastructure.security.JwtUserPrincipal;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro interceptor global de trazabilidad.
 * Genera/propaga el X-Correlation-ID y gestiona el contexto MDC (Mapped Diagnostic Context)
 * agregando 'correlationId' y 'userId' para enriquecer los logs del hilo.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class TraceabilityFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(TraceabilityFilter.class);
    private static final String CORRELATION_HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startTime = System.currentTimeMillis();

        String correlationId = request.getHeader(CORRELATION_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put("correlationId", correlationId);
        response.setHeader(CORRELATION_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Resolver User ID del contexto de seguridad una vez que el chain se haya ejecutado
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof JwtUserPrincipal principal) {
                MDC.put("userId", String.valueOf(principal.getUserId()));
            } else if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                MDC.put("userId", auth.getName());
            } else {
                MDC.put("userId", "anonymous");
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("Request processed: method={}, path={}, status={}, duration={}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), duration);

            MDC.clear();
        }
    }
}
