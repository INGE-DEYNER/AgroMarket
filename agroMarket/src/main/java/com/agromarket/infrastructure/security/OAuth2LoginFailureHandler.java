package com.agromarket.infrastructure.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.agromarket.infrastructure.config.properties.AppProperties;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginFailureHandler
        implements AuthenticationFailureHandler {

    private final SafeRedirectUtil safeRedirectUtil;
    private final AppProperties properties;

    public OAuth2LoginFailureHandler(
            SafeRedirectUtil safeRedirectUtil,
            AppProperties properties) {

        this.safeRedirectUtil = safeRedirectUtil;

        this.properties = properties;
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException, ServletException {

        String redirect = safeRedirectUtil.validate(
                properties
                        .getOauth2()
                        .getFailureRedirect(),
                properties
                        .getOauth2()
                        .getFailureRedirect());

        String separator = redirect.contains("?")
                ? "&"
                : "?";

        response.sendRedirect(
                redirect
                        + separator
                        + "error=oauth2_login_failed");
    }
}