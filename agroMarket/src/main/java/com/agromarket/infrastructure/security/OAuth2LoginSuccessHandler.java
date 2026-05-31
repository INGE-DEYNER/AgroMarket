package com.agromarket.infrastructure.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import com.agromarket.application.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = stringValue(oauth2User.getAttribute("email"));
        String nombre = firstNonBlank(
                stringValue(oauth2User.getAttribute("name")),
                stringValue(oauth2User.getAttribute("given_name")),
                email);
        String subject = stringValue(oauth2User.getAttribute("sub"));

        var authResponse = authService.completarGoogleOAuth2(email, nombre, subject);
        String redirect = UriComponentsBuilder.fromHttpUrl(frontendBaseUrl)
                .path("/login.html")
                .queryParam("token", authResponse.getToken())
                .queryParam("rol", authResponse.getRol())
                .queryParam("nombre", authResponse.getNombre())
                .queryParam("correo", authResponse.getCorreo())
                .build(true)
                .toUriString();
        response.sendRedirect(redirect);
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "Usuario";
    }
}

