package com.agromarket.infrastructure.security;

import java.io.IOException;

import com.agromarket.config.properties.AppProperties;
import com.agromarket.application.service.AuthService;
import org.springframework.http.ResponseCookie;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@SuppressWarnings({"null", "unused"})
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
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = stringValue(oauth2User.getAttribute("email"));
        String nombre = firstNonBlank(
                stringValue(oauth2User.getAttribute("name")),
                stringValue(oauth2User.getAttribute("given_name")),
                email);
        String subject = stringValue(oauth2User.getAttribute("sub"));

        var authResponse = authService.completarGoogleOAuth2(email, nombre, subject);
        ResponseCookie cookie = ResponseCookie.from(OAUTH2_TEMP_COOKIE, authResponse.getToken())
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .sameSite("None")
                .maxAge(300)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        String redirect = UriComponentsBuilder.fromUriString(appProperties.frontendUrl())
                .path("/login.html")
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
