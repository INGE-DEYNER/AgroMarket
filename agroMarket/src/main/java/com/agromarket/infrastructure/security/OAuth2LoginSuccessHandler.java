package com.agromarket.infrastructure.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;

import com.agromarket.config.properties.AppProperties;
import com.agromarket.application.service.AuthService;
import org.springframework.http.ResponseCookie;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private static final String OAUTH2_TEMP_COOKIE = "agromarket_oauth2_token";

    private final AuthService authService;
    private final AppProperties appProperties;

    public OAuth2LoginSuccessHandler(@Lazy AuthService authService, AppProperties appProperties) {
        this.authService = authService;
        this.appProperties = appProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = Optional.ofNullable(
            (String) oAuth2User.getAttributes().get("email"))
            .orElseThrow(() -> new OAuth2AuthenticationException("Email not found in Google response"));

        String name = Optional.ofNullable(
            (String) oAuth2User.getAttributes().get("name"))
            .orElse("Usuario");

        String picture = Optional.ofNullable(
            (String) oAuth2User.getAttributes().get("picture"))
            .orElse("");

        String googleId = Optional.ofNullable(
            (String) oAuth2User.getAttributes().get("sub"))
            .orElseThrow(() -> new OAuth2AuthenticationException("Google ID not found in Google response"));

        String rolSolicitado = "COMPRADOR"; // Default
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("oauth2_rol_solicitado".equals(c.getName())) {
                    rolSolicitado = c.getValue();
                    break;
                }
            }
        }

        var authResponse = authService.completarGoogleOAuth2(email, name, picture, rolSolicitado, googleId);
        
        if (authResponse.isPendienteAprobacion()) {
            String redirect = UriComponentsBuilder
                .fromUriString(appProperties.frontendUrl())
                .path("/login")
                .queryParam("oauth2", "pending")
                .build(true).toUriString();
            response.sendRedirect(redirect);
            return;
        }
        
        ResponseCookie cookie = ResponseCookie.from("agromarket_oauth2_token", authResponse.getToken())
            .httpOnly(true)
            .secure(true)
            .sameSite("None")   // OBLIGATORIO para cross-domain
            .path("/")
            .maxAge(Duration.ofMinutes(5))
            .domain(null)       // null = dominio del backend solamente
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        String redirect = UriComponentsBuilder
            .fromUriString(appProperties.frontendUrl()) // debe ser https://agro-market.app
            .path("/login")
            .queryParam("oauth2", "success")
            .queryParam("token", authResponse.getToken())
            .build(true).toUriString();
        response.sendRedirect(redirect);
    }
}
