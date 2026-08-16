// infrastructure/security/JwtAuthenticationFilter.java
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

/**
 * Filtro JWT para autenticación HTTP.
 */
@Component
public class JwtAuthenticationFilter
                extends OncePerRequestFilter {

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

                String header = request.getHeader(
                                HttpHeaders.AUTHORIZATION);

                if (header == null
                                || !header.startsWith("Bearer ")) {

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                String token = header
                                .substring(7)
                                .trim();

                if (token.isBlank()
                                || !jwtTokenProvider.validateToken(token)) {

                        unauthorized(response);
                        return;
                }

                try {
                        Optional<Long> userId = jwtTokenProvider.extractUserId(token);

                        Optional<String> tokenRole = jwtTokenProvider.extractRole(token);

                        if (userId.isEmpty()
                                        || tokenRole.isEmpty()) {

                                unauthorized(response);
                                return;
                        }

                        UserDetails userDetails = userDetailsService.loadUserById(
                                        userId.get());

                        if (!(userDetails instanceof JwtUserPrincipal principal)) {
                                unauthorized(response);
                                return;
                        }

                        String actualRole = principal.getRole();

                        if (actualRole == null
                                        || !actualRole.equals(
                                                        tokenRole.get())) {

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

                        filterChain.doFilter(
                                        request,
                                        response);

                } catch (Exception exception) {

                        SecurityContextHolder
                                        .clearContext();

                        unauthorized(response);
                }
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