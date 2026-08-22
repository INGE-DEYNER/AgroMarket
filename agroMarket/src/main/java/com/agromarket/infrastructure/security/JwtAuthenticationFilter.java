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

                if (isPublicEndpoint(path)) {
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
         * Determina si una ruta es completamente pública.
         */
        private boolean isPublicEndpoint(String path) {

                /*
                 * Excepción: /mis-productos requiere autenticación (necesita
                 * saber quién es el productor), aunque cuelgue de
                 * /api/v1/products, que en general SÍ es público para GET.
                 */
                if (path.equals("/api/v1/products/mis-productos")) {
                        return false;
                }

                return matches(path, "/api/public")
                                || matches(path, "/api/divisas")
                                || matches(path, "/api/productos")
                                || matches(path, "/api/resenas")
                                || matches(path, "/api/auth")
                                || matches(path, "/api/v1/auth")
                                || matches(path, "/api/v1/products")
                                || matches(path, "/api/v1/reviews")
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