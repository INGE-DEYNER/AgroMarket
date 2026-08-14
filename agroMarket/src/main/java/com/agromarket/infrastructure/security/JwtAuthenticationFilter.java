package com.agromarket.infrastructure.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.agromarket.domain.user.enums.Role;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            boolean valid = jwtTokenProvider.validateToken(token);
            if (valid && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtTokenProvider.extractEmail(token);
                Long userId = jwtTokenProvider.extractUserId(token);
                Role role = jwtTokenProvider.extractRole(token);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    JwtUserPrincipal.builder().email(email).userId(userId).role(role).build(),
                        null,
                        role == null ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                org.slf4j.MDC.put("userId", String.valueOf(userId));
            } else if (!valid) {
                try {
                    String ip = request.getRemoteAddr();
                    String path = request.getRequestURI();
                    log.warn("Acceso con token inválido/expirado - ip={} path={} timestamp={}", ip, path, System.currentTimeMillis());
                } catch (Exception e) {
                    log.warn("Acceso con token inválido/expirado - unable to obtain request context");
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
