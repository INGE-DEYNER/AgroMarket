package com.agromarket.infrastructure.security;

import java.io.IOException;
import java.net.URI;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.agromarket.domain.models.user.User;
import com.agromarket.domain.ports.in.user.AuthenticationPort;
import com.agromarket.domain.ports.out.user.AuthenticationTokenPort;
import com.agromarket.domain.ports.out.user.UserPort;
import com.agromarket.infrastructure.config.properties.AppProperties;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler
                implements AuthenticationSuccessHandler {

        private final AuthenticationPort authenticationPort;
        private final AuthenticationTokenPort tokenPort;
        private final UserPort userPort;
        private final SafeRedirectUtil safeRedirectUtil;
        private final AppProperties properties;

        public OAuth2LoginSuccessHandler(
                        AuthenticationPort authenticationPort,
                        AuthenticationTokenPort tokenPort,
                        UserPort userPort,
                        SafeRedirectUtil safeRedirectUtil,
                        AppProperties properties) {

                this.authenticationPort = authenticationPort;

                this.tokenPort = tokenPort;

                this.userPort = userPort;

                this.safeRedirectUtil = safeRedirectUtil;

                this.properties = properties;
        }

        @Override
        public void onAuthenticationSuccess(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        Authentication authentication)
                        throws IOException, ServletException {

                try {
                        String code = request.getParameter("code");

                        if (code == null
                                        || code.isBlank()) {

                                throw new IllegalStateException(
                                                "No se recibió authorization code");
                        }

                        String requestedRole = resolveRequestedRole(request);

                        /*
                         * El port de dominio completa/crea el usuario Google.
                         * El resultado concreto no se usa aquí porque el contrato
                         * interno puede evolucionar; después buscamos el usuario
                         * persistido por el email autenticado.
                         */
                        authenticationPort
                                        .completeGoogleOAuth2(
                                                        code,
                                                        requestedRole);

                        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

                        String email = oauth2User.getAttribute(
                                        "email");

                        if (email == null
                                        || email.isBlank()) {

                                throw new IllegalStateException(
                                                "Google no devolvió email");
                        }

                        User user = userPort.findByEmail(email)
                                        .orElseThrow(() -> new IllegalStateException(
                                                        "Usuario Google no encontrado"));

                        String jwt = tokenPort.generate(user);

                        String redirect = safeRedirectUtil.validate(
                                        properties
                                                        .getOauth2()
                                                        .getSuccessRedirect(),
                                        properties
                                                        .getOauth2()
                                                        .getSuccessRedirect());

                        /*
                         * Se usa query parameter por simplicidad de integración con
                         * el frontend actual. En producción se recomienda reemplazar
                         * esto por una cookie HttpOnly/Secure/SameSite o un código
                         * one-time para evitar que el JWT quede en el historial.
                         */
                        String location = appendToken(
                                        redirect,
                                        jwt);

                        response.sendRedirect(location);

                } catch (Exception ex) {

                        response.sendError(
                                        HttpServletResponse.SC_UNAUTHORIZED,
                                        "No fue posible completar el login con Google");
                }
        }

        private String resolveRequestedRole(
                        HttpServletRequest request) {

                String requested = request.getParameter(
                                "requestedRole");

                if (requested == null
                                || requested.isBlank()) {

                        return properties
                                        .getOauth2()
                                        .getDefaultRole();
                }

                String normalized = requested
                                .trim()
                                .toUpperCase();

                /*
                 * Nunca permitimos que el callback OAuth pueda pedir ADMIN.
                 */
                if ("BUYER".equals(normalized)) {
                        return normalized;
                }

                if ("PRODUCER".equals(normalized)) {
                        return normalized;
                }

                return properties
                                .getOauth2()
                                .getDefaultRole();
        }

        private String appendToken(
                        String redirect,
                        String token) {

                String separator = redirect.contains("?")
                                ? "&"
                                : "?";

                return redirect
                                + separator
                                + "token="
                                + java.net.URLEncoder.encode(
                                                token,
                                                java.nio.charset.StandardCharsets.UTF_8);
        }
}