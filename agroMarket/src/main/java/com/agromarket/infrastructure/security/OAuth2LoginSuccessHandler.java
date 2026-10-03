package com.agromarket.infrastructure.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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

        /**
         * Cookie httpOnly donde se deposita el JWT tras un login social.
         * La consume {@code GET /api/v1/auth/token-exchange}.
         */
        public static final String SESSION_COOKIE_NAME = "AGROMARKET_SESSION";

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
                         * El JWT se entrega en una cookie HttpOnly y NO en la
                         * URL. Ponerlo en la query lo exponía en el historial del
                         * navegador, en el referer y en los logs de acceso; el
                         * frontend lo recupera con GET /auth/token-exchange,
                         * que lee esta cookie. Así el token nunca sale del
                         * servidor hacia una URL.
                         */
                        ResponseCookie sessionCookie = ResponseCookie
                                        .from(SESSION_COOKIE_NAME, jwt)
                                        .httpOnly(true)
                                        .secure(request.isSecure())
                                        .path("/")
                                        .maxAge(java.time.Duration.ofHours(8))
                                        .sameSite("Lax")
                                        .build();

                        response.addHeader(
                                        HttpHeaders.SET_COOKIE,
                                        sessionCookie.toString());

                        // La URL solo lleva la señal de éxito, nunca el token.
                        String location = appendOAuth2Success(redirect);

                        response.sendRedirect(location);

                } catch (Exception ex) {

                        response.sendError(
                                        HttpServletResponse.SC_UNAUTHORIZED,
                                        "No fue posible completar el login con Google");
                }
        }

        /**
         * Añade la marca {@code oauth2=success} a la redirección, que es lo
         * que dispara el intercambio de token en el frontend.
         */
        private String appendOAuth2Success(String redirect) {

                String separator = redirect.contains("?")
                                ? "&"
                                : "?";

                return redirect
                                + separator
                                + "oauth2=success";
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
}