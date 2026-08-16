package com.agromarket.infrastructure.security;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.agromarket.infrastructure.config.properties.BrevoProperties;
import com.agromarket.domain.ports.out.user.EmailPort;

@Component
public class BrevoEmailAdapter
                implements EmailPort {

        private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

        private final RestClient restClient;
        private final BrevoProperties properties;

        public BrevoEmailAdapter(
                        RestClient.Builder restClientBuilder,
                        BrevoProperties properties) {

                this.restClient = restClientBuilder.build();

                this.properties = properties;
        }

        @Override
        public void sendVerificationEmail(
                        String email,
                        String token) {

                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El email destinatario es obligatorio");
                }

                if (token == null || token.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El token de verificación es obligatorio");
                }

                String verificationUrl = properties.getSender() != null
                                ? buildVerificationUrl(token)
                                : token;

                String html = """
                                <html>
                                  <body>
                                    <h2>Verifica tu cuenta de AgroMarket</h2>
                                    <p>
                                      Para verificar tu cuenta haz clic en el siguiente enlace:
                                    </p>
                                    <p>
                                      <a href="%s">Verificar cuenta</a>
                                    </p>
                                  </body>
                                </html>
                                """.formatted(
                                verificationUrl);

                send(
                                email,
                                "Verifica tu cuenta de AgroMarket",
                                html);
        }

        @Override
        public void sendPasswordResetEmail(
                        String email,
                        String token) {

                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El email destinatario es obligatorio");
                }

                if (token == null || token.isBlank()) {
                        throw new IllegalArgumentException(
                                        "El token de recuperación es obligatorio");
                }

                String resetUrl = buildResetUrl(token);

                String html = """
                                <html>
                                  <body>
                                    <h2>Recuperación de contraseña</h2>
                                    <p>
                                      Hemos recibido una solicitud para restablecer
                                      tu contraseña de AgroMarket.
                                    </p>
                                    <p>
                                      <a href="%s">Restablecer contraseña</a>
                                    </p>
                                  </body>
                                </html>
                                """.formatted(
                                resetUrl);

                send(
                                email,
                                "Recuperación de contraseña - AgroMarket",
                                html);
        }

        private void send(
                        String email,
                        String subject,
                        String html) {

                String apiKey = properties.getApi() == null
                                ? null
                                : properties
                                                .getApi()
                                                .getKey();

                if (apiKey == null
                                || apiKey.isBlank()) {

                        throw new IllegalStateException(
                                        "brevo.api.key es obligatorio");
                }

                String senderEmail = properties.getSender() == null
                                ? null
                                : properties
                                                .getSender()
                                                .getEmail();

                String senderName = properties.getSender() == null
                                ? null
                                : properties
                                                .getSender()
                                                .getName();

                if (senderEmail == null
                                || senderEmail.isBlank()) {

                        throw new IllegalStateException(
                                        "brevo.sender.email es obligatorio");
                }

                Map<String, Object> body = Map.of(
                                "sender",
                                Map.of(
                                                "name",
                                                senderName == null
                                                                ? "AgroMarket"
                                                                : senderName,
                                                "email",
                                                senderEmail),
                                "to",
                                List.of(
                                                Map.of(
                                                                "email",
                                                                email)),
                                "subject",
                                subject,
                                "htmlContent",
                                html);

                restClient.post()
                                .uri(BREVO_ENDPOINT)
                                .header(
                                                "api-key",
                                                apiKey)
                                .body(body)
                                .retrieve()
                                .toBodilessEntity();
        }

        private String buildVerificationUrl(
                        String token) {

                return "http://localhost:3000/verify-email"
                                + "?token="
                                + token;
        }

        private String buildResetUrl(
                        String token) {

                return "http://localhost:3000/reset-password"
                                + "?token="
                                + token;
        }
}