package com.agromarket.infrastructure.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtTokenProvider jwtTokenProvider;
        private final UserDetailsServiceImpl userDetailsService;

        public JwtAuthenticationFilter(
                        JwtTokenProvider jwtTokenProvider,
                        UserDetailsServiceImpl userDetailsService) {

                this.jwtTokenProvider = jwtTokenProvider;
                this.userDetailsService = userDetailsService;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String path = request.getRequestURI();

                /*
                 * ============================================================
                 * ENDPOINTS PÚBLICOS
                 * ============================================================
                 *
                 * IMPORTANTE:
                 * Se comprueba tanto la ruta exacta como sus subrutas.
                 *
                 * Ejemplo:
                 *
                 * /api/productos
                 * /api/productos/123
                 *
                 * /api/resenas
                 * /api/resenas/123
                 */

                /*
                 * CAUSA RAÍZ del bug "HTTP 401 al guardar un producto":
                 * antes se clasificaba SOLO por la ruta, sin mirar el método
                 * HTTP, así que POST/PUT/PATCH/DELETE sobre /api/v1/products
                 * (o /api/productos) se consideraban públicos, se saltaba el
                 * JWT, y luego Spring Security caía en anyRequest().authenticated()
                 * devolviendo 401 aunque el cliente enviara el token.
                 *
                 * Sólo GET es público sobre el catálogo de productos/resenas.
                 * Cualquier escritura REQUIERE el token.
                 */
                if (isPublicEndpoint(path, request.getMethod())) {
                        filterChain.doFilter(request, response);
                        return;
                }

                /*
                 * ============================================================
                 * JWT
                 * ============================================================
                 */

                String header = request.getHeader(HttpHeaders.AUTHORIZATION);

                /*
                 * Si no existe token, no intentamos autenticar.
                 *
                 * Spring Security decidirá posteriormente si la ruta
                 * necesita autenticación.
                 */
                if (header == null || !header.startsWith("Bearer ")) {
                        filterChain.doFilter(request, response);
                        return;
                }

                String token = header.substring(7).trim();

                /*
                 * Token vacío o inválido.
                 */
                if (token.isBlank() || !jwtTokenProvider.validateToken(token)) {
                        unauthorized(response);
                        return;
                }

                try {

                        Optional<Long> userId = jwtTokenProvider.extractUserId(token);

                        Optional<String> tokenRole = jwtTokenProvider.extractRole(token);

                        if (userId.isEmpty() || tokenRole.isEmpty()) {
                                unauthorized(response);
                                return;
                        }

                        UserDetails userDetails = userDetailsService.loadUserById(userId.get());

                        if (!(userDetails instanceof JwtUserPrincipal principal)) {
                                unauthorized(response);
                                return;
                        }

                        String actualRole = principal.getRole();

                        if (actualRole == null ||
                                        !actualRole.equals(tokenRole.get())) {

                                unauthorized(response);
                                return;
                        }

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                        principal,
                                        null,
                                        principal.getAuthorities());

                        authentication.setDetails(request);

                        SecurityContextHolder
                                        .getContext()
                                        .setAuthentication(authentication);

                        filterChain.doFilter(request, response);

                } catch (Exception exception) {

                        SecurityContextHolder
                                        .clearContext();

                        unauthorized(response);
                }
        }

        /**
         * Determina si una ruta es completamente pública, considerando
         * tanto el path como el método HTTP.
         *
         * Sólo GET es público sobre el catálogo (productos/resenas) y
         * sobre divisas. Escrituras (POST/PUT/PATCH/DELETE) siempre
         * requieren token. /auth, /public y /actuator son públicas
         * para cualquier método.
         */
        private boolean isPublicEndpoint(String path, String method) {

                boolean isRead = "GET".equalsIgnoreCase(method);

                /*
                 * Excepción: /mis-productos requiere autenticación (necesita
                 * saber quién es el productor), aunque cuelga de
                 * /api/v1/products, que en general SÍ es público para GET.
                 */
                if (path.equals("/api/v1/products/mis-productos")) {
                        return false;
                }
                if (path.equals("/api/v1/orders/mis-pedidos")) {
                        return false;
                }
                if (path.equals("/api/v1/reviews/mis-resenas")) {
                        return false;
                }

                /*
                 * Catálogo y reseñas: sólo GET es público.
                 */
                if (isRead
                                && (matches(path, "/api/productos")
                                                || matches(path, "/api/v1/products")
                                                || matches(path, "/api/resenas")
                                                || matches(path, "/api/v1/reviews"))) {
                        return true;
                }

                /*
                 * Divisas: GET (consultar tasas) es público.
                 */
                if (isRead && matches(path, "/api/divisas")) {
                        return true;
                }

                return matches(path, "/api/public")
                                || matches(path, "/api/auth")
                                || matches(path, "/api/v1/auth")
                                || matches(path, "/actuator");
        }

        /**
         * Permite:
         *
         * /api/productos
         * /api/productos/
         * /api/productos/123
         *
         * pero no confunde rutas como:
         *
         * /api/productosXYZ
         */
        private boolean matches(String path, String basePath) {

                return path.equals(basePath)
                                || path.startsWith(basePath + "/");
        }

        private void unauthorized(
                        HttpServletResponse response)
                        throws IOException {

                SecurityContextHolder
                                .clearContext();

                response.setStatus(
                                HttpServletResponse.SC_UNAUTHORIZED);

                response.setContentType(
                                MediaType.APPLICATION_JSON_VALUE);

                response.getWriter().write(
                                """
                                                {
                                                    "status": 401,
                                                    "error": "Unauthorized",
                                                    "message": "Token inválido o expirado"
                                                }
                                                """);
        }
}