package com.agromarket.infrastructure.config;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Alias de rutas API.
 *
 * <p>El frontend siempre llama usando {@code VITE_API_URL =
 * http://localhost:8080/api/v1} como base y rutas en español
 * (/productos, /resenas, /pedidos...), mientras que los controladores
 * viven en inglés y con prefijo /v1. Este filtro se ejecuta ANTES que Spring
 * Security y el DispatcherServlet y reescribe la URI entrante hacia la ruta
 * real del controlador.</p>
 *
 * <p>No es un redirect: es una reescritura interna del request, invisible
 * para el navegador.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiPathAliasFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(ApiPathAliasFilter.class);

    /**
     * Orden del mapa importante: se evalúa de arriba hacia abajo y se aplica
     * el primer alias que coincida, así que los prefijos más específicos van
     * primero.
     */
    private static final Map<String, String> ALIASES = new LinkedHashMap<>();

    static {
        // Catálogo / público
        ALIASES.put("/api/v1/productos", "/api/v1/products");
        ALIASES.put("/api/v1/resenas", "/api/v1/reviews");
        ALIASES.put("/api/v1/divisas", "/api/divisas");
        ALIASES.put("/api/v1/public", "/api/public");
        ALIASES.put("/config/system", "/api/v1/config/system");

        // Módulos autenticados
        ALIASES.put("/api/v1/pedidos", "/api/v1/orders");
        ALIASES.put("/api/v1/envios", "/api/v1/shipments");
        ALIASES.put("/api/v1/mensajes", "/api/v1/messages");
        ALIASES.put("/api/v1/usuarios", "/api/v1/users");
        ALIASES.put("/api/v1/cupones", "/api/v1/coupons");
        ALIASES.put("/api/v1/facturas", "/api/v1/invoices");
        ALIASES.put("/api/v1/pagos", "/api/v1/payments");

        /*
         * El frontend llama a /admin/... (singular) pero los controladores
         * administrativos viven en /api/v1/admins (plural). Sin este alias,
         * todas las peticiones del panel de administración terminaban en
         * 404 y el panel aparecía vacío.
         */
        ALIASES.put("/api/v1/admin", "/api/v1/admins");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest) {
            String uri = httpRequest.getRequestURI();
            String method = httpRequest.getMethod();

            String matchedFrom = null;
            String rewritten = null;

            for (Map.Entry<String, String> alias : ALIASES.entrySet()) {
                String from = alias.getKey();

                if (uri.equals(from) || uri.startsWith(from + "/")) {
                    matchedFrom = from;
                    rewritten = alias.getValue() + uri.substring(from.length());
                    break;
                }
            }

            if (rewritten != null) {
                log.trace("api-alias [{}] {} -> {}", method, uri, rewritten);
                chain.doFilter(new RewrittenUriRequest(httpRequest, rewritten), response);
                return;
            }

            log.trace("api-alias-no-match [{}] {}", method, uri);
        }

        chain.doFilter(request, response);
    }

    /**
     * Envoltorio del request original que expone la URI ya reescrita.
     *
     * <p><b>Motivo de sobrescribir tres métodos:</b> Spring Security 6 evalúa
     * los {@code requestMatchers} contra {@code getServletPath()} +
     * {@code getPathInfo()}, no contra {@code getRequestURI()}. Con el
     * dispatcher en {@code /}, ese PathInfo llegaba vacío, la ruta efectiva se
     * quedaba en {@code /} y <b>ninguna</b> regla {@code permitAll} coincidía:
     * todas las rutas bajo {@code /api/v1/**} caían en
     * {@code anyRequest().authenticated()} y devolvían 401. Eso rompía
     * endpoints públicos como {@code POST /api/v1/auth/login} y
     * {@code POST /api/v1/auth/recuperar-contrasena}.</p>
     *
     * <p>La reescritura debe ser visible tanto para Spring Security (que
     * decide el acceso) como para el DispatcherServlet (que resuelve el
     * controlador).</p>
     */
    private static class RewrittenUriRequest extends HttpServletRequestWrapper {

        private final String rewrittenUri;

        public RewrittenUriRequest(HttpServletRequest request, String rewrittenUri) {
            super(request);
            this.rewrittenUri = rewrittenUri;
        }

        @Override
        public String getRequestURI() {
            return rewrittenUri;
        }

        @Override
        public String getServletPath() {
            return rewrittenUri;
        }

        @Override
        public String getPathInfo() {
            return null;
        }
    }
}