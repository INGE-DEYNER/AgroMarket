package com.agromarket.infrastructure.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.agromarket.config.properties.AppProperties;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final AppProperties appProperties;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        
        log.warn("OAuth2 Login falló: {}", exception.getMessage());
        
        String errorParam = "oauth2_error";
        if (exception.getMessage() != null && exception.getMessage().contains("pendiente de aprobación")) {
            errorParam = "pending_approval";
        }

        String redirect = UriComponentsBuilder
                .fromUriString(appProperties.frontendUrl())
                .path("/login")
                .queryParam("error", errorParam)
                .build(true).toUriString();

        response.sendRedirect(redirect);
    }
}
