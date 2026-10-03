package com.agromarket.infrastructure.security;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.agromarket.domain.ports.out.user.GoogleOAuth2Port;

@Component
public class GoogleOAuth2ClientAdapter
                implements GoogleOAuth2Port {

        private static final String AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

        private static final String TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

        private static final String USER_INFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

        private final RestClient restClient;
        private final String clientId;
        private final String clientSecret;
        private final String redirectUri;

        public GoogleOAuth2ClientAdapter(
                        RestClient.Builder restClientBuilder,
                        @Value("${app.google.client-id}") String clientId,
                        @Value("${app.google.client-secret}") String clientSecret,
                        @Value("${app.google.redirect-uri}") String redirectUri) {

                this.restClient = restClientBuilder.build();

                this.clientId = clientId;
                this.clientSecret = clientSecret;
                this.redirectUri = redirectUri;
        }

        @Override
        public String buildAuthorizationUrl() {

                return AUTHORIZATION_ENDPOINT
                                + "?client_id="
                                + encode(clientId)
                                + "&redirect_uri="
                                + encode(redirectUri)
                                + "&response_type=code"
                                + "&scope="
                                + encode("openid email profile");
        }

        @Override
        public GoogleUserInfo exchangeCodeForUserInfo(
                        String code) {

                if (code == null || code.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El authorization code es obligatorio");
                }

                MultiValueMap<String, String> form = new LinkedMultiValueMap<>();

                form.add("code", code);
                form.add("client_id", clientId);
                form.add("client_secret", clientSecret);
                form.add("redirect_uri", redirectUri);
                form.add(
                                "grant_type",
                                "authorization_code");

                Map<?, ?> tokenResponse = restClient.post()
                                .uri(TOKEN_ENDPOINT)
                                .contentType(
                                                MediaType.APPLICATION_FORM_URLENCODED)
                                .body(form)
                                .retrieve()
                                .body(Map.class);

                if (tokenResponse == null
                                || tokenResponse.get("access_token") == null) {

                        throw new IllegalStateException(
                                        "Google no devolvió un access_token");
                }

                String accessToken = String.valueOf(
                                tokenResponse.get(
                                                "access_token"));

                Map<?, ?> userInfo = restClient.get()
                                .uri(USER_INFO_ENDPOINT)
                                .headers(headers -> headers.setBearerAuth(
                                                accessToken))
                                .retrieve()
                                .body(Map.class);

                if (userInfo == null) {
                        throw new IllegalStateException(
                                        "Google no devolvió información del usuario");
                }

                return new GoogleUserInfo(
                                value(userInfo, "email"),
                                value(userInfo, "given_name"),
                                value(userInfo, "picture"),
                                value(userInfo, "sub"));
        }

        private String value(
                        Map<?, ?> values,
                        String key) {

                Object value = values.get(key);

                return value == null
                                ? null
                                : value.toString();
        }

        private String encode(
                        String value) {

                return URLEncoder.encode(
                                value,
                                StandardCharsets.UTF_8);
        }
}