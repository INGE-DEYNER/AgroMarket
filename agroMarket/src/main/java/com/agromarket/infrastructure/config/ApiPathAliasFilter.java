package com.agromarket.infrastructure.config;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

/**
 * Alias de rutas API (causa raíz de los 401 masivos en consola).
 *
 * PROBLEMA:
 * El frontend siempre llama a la API usando VITE_API_URL =
 * http://localhost:8080/api/v1
 * como base, y luego rutas en español: /productos, /resenas, /divisas, /public,
 * /pedidos, /envios, /mensajes, /usuarios, /cupones, /facturas, /pagos...
 *
 * Pero los controladores del backend NO son consistentes entre sí:
 * - Unos están en inglés con /v1 -> /api/v1/products, /api/v1/reviews,
 * /api/v1/orders, /api/v1/shipments, /api/v1/messages, /api/v1/users,
 * /api/v1/coupons, /api/v1/invoices, /api/v1/payments
 * - Otros están en español SIN /v1 -> /api/divisas, /api/productos, /api/public
 *
 * Como ninguna de las dos formas coincide exactamente con lo que pide el
 * frontend (/api/v1/productos, /api/v1/divisas, /api/v1/public,
 * /api/v1/resenas...),
 * Spring Security nunca encuentra esas rutas en la lista "permitAll" y cae en
 * "anyRequest().authenticated()" -> 401, incluso para endpoints que deberían
 * ser públicos.
 *
 * SOLUCIÓN:
 * Este filtro se ejecuta ANTES que Spring Security y el DispatcherServlet
 * (Ordered.HIGHEST_PRECEDENCE) y reescribe la URI entrante hacia la ruta real
 * del controlador, de forma transparente. Ni Spring Security ni los
 * controladores necesitan enterarse: ven directamente la ruta correcta.
 *
 * No es un redirect (el navegador no se entera y no cambia la URL visible),
 * es una reescritura interna del request antes de que llegue al resto de la
 * cadena de filtros.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiPathAliasFilter implements Filter {

    /**
     * Orden del mapa importante: se evalúa de arriba hacia abajo y se aplica
     * el primer alias que matchee, así que los prefijos más específicos van
     * primero.
     */
    private static final Map<String, String> ALIASES = new LinkedHashMap<>();

    static {
        // Catálogo / público
        ALIASES.put("/api/v1/productos", "/api/v1/products");
        ALIASES.put("/api/v1/resenas", "/api/v1/reviews");
        ALIASES.put("/api/v1/divisas", "/api/divisas");
        ALIASES.put("/api/v1/public", "/api/public");

        // Módulos autenticados
        ALIASES.put("/api/v1/pedidos", "/api/v1/orders");
        ALIASES.put("/api/v1/envios", "/api/v1/shipments");
        ALIASES.put("/api/v1/mensajes", "/api/v1/messages");
        ALIASES.put("/api/v1/usuarios", "/api/v1/users");
        ALIASES.put("/api/v1/cupones", "/api/v1/coupons");
        ALIASES.put("/api/v1/facturas", "/api/v1/invoices");
        ALIASES.put("/api/v1/pagos", "/api/v1/payments");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest) {
            String uri = httpRequest.getRequestURI();

            for (Map.Entry<String, String> alias : ALIASES.entrySet()) {
                String from = alias.getKey();

                if (uri.equals(from) || uri.startsWith(from + "/")) {
                    String rewritten = alias.getValue() + uri.substring(from.length());

                    chain.doFilter(new RewrittenUriRequest(httpRequest, rewritten), response);

                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }

    /**
     * Envuelve el request original exponiendo la URI ya reescrita, tanto para
     * Spring Security (autorización) como para el DispatcherServlet (mapeo a
     * controladores).
     */
    private static class RewrittenUriRequest extends HttpServletRequestWrapper {

        private final String rewrittenUri;

        RewrittenUriRequest(HttpServletRequest request, String rewrittenUri) {
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
    }
}