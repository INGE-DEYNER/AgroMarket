package com.agromarket.infrastructure.security;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    public static final String OAUTH2_AUTH_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        Cookie cookie = getCookie(request, OAUTH2_AUTH_REQUEST_COOKIE_NAME);
        if (cookie == null) {
            return null;
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(cookie.getValue());
            try (ObjectInputStream inputStream = new ObjectInputStream(new ByteArrayInputStream(decoded))) {
                return (OAuth2AuthorizationRequest) inputStream.readObject();
            }
        } catch (IOException | ClassNotFoundException ex) {
            return null;
        }
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            deleteCookie(request, response, OAUTH2_AUTH_REQUEST_COOKIE_NAME);
            return;
        }

        String roleParam = request.getParameter("role");
        if (roleParam == null || roleParam.isBlank()) {
            roleParam = request.getParameter("rol");
        }
        if (roleParam != null && !roleParam.isBlank()) {
            ResponseCookie roleCookie = ResponseCookie.from("oauth2_rol_solicitado", roleParam)
                    .secure(request.isSecure())
                    .path("/")
                    .maxAge(COOKIE_EXPIRE_SECONDS)
                    .sameSite("Lax")
                    .build();
            response.addHeader("Set-Cookie", roleCookie.toString());
        }

        ResponseCookie cookie = ResponseCookie.from(OAUTH2_AUTH_REQUEST_COOKIE_NAME, Base64.getUrlEncoder().encodeToString(serialize(authorizationRequest)))
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(COOKIE_EXPIRE_SECONDS)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = loadAuthorizationRequest(request);
        deleteCookie(request, response, OAUTH2_AUTH_REQUEST_COOKIE_NAME);
        return authorizationRequest;
    }

    private void deleteCookie(HttpServletRequest request, HttpServletResponse response, String cookieName) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private Cookie getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie;
            }
        }
        return null;
    }

    private byte[] serialize(OAuth2AuthorizationRequest authorizationRequest) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
             ObjectOutputStream objectOutputStream = new ObjectOutputStream(outputStream)) {
            objectOutputStream.writeObject(authorizationRequest);
            objectOutputStream.flush();
            return outputStream.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo serializar la autorización OAuth2", ex);
        }
    }
}

