package com.agromarket.infrastructure.security;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.agromarket.domain.ports.out.user.EmailPort;
import com.agromarket.infrastructure.config.properties.BrevoProperties;

@Component
public class BrevoEmailAdapter implements EmailPort {

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;
    private final BrevoProperties properties;
    private final String frontendUrl;

    public BrevoEmailAdapter(
            RestClient.Builder restClientBuilder,
            BrevoProperties properties,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {

        this.restClient = restClientBuilder.build();
        this.properties = properties;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public void sendVerificationEmail(
            String email,
            String token) {

        validateEmail(email);
        validateToken(token);

        String verificationUrl = buildVerificationUrl(token);

        String html = """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>Verifica tu cuenta</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f4f7f4;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                    <div style="
                        max-width:680px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:18px;
                        overflow:hidden;
                        box-shadow:0 8px 30px rgba(0,0,0,.08);
                    ">

                        <div style="
                            background:#176b32;
                            padding:42px;
                            color:white;
                        ">

                            <div style="
                                font-size:14px;
                                letter-spacing:3px;
                                font-weight:bold;
                                margin-bottom:18px;
                            ">
                                AGROMARKET
                            </div>

                            <h1 style="
                                margin:0;
                                font-size:32px;
                            ">
                                Verifica tu cuenta
                            </h1>

                        </div>

                        <div style="
                            padding:40px;
                            color:#17351f;
                        ">

                            <p style="font-size:17px;line-height:1.7;">
                                Bienvenido a AgroMarket.
                            </p>

                            <p style="font-size:16px;line-height:1.7;">
                                Para activar tu cuenta,
                                haz clic en el siguiente botón:
                            </p>

                            <div style="text-align:center;margin:32px 0;">

                                <a href="%s"
                                   style="
                                       display:inline-block;
                                       background:#176b32;
                                       color:white;
                                       text-decoration:none;
                                       padding:15px 30px;
                                       border-radius:10px;
                                       font-weight:bold;
                                   ">
                                    Verificar cuenta
                                </a>

                            </div>

                            <p style="
                                font-size:14px;
                                color:#718078;
                                line-height:1.6;
                            ">
                                Si no creaste esta cuenta,
                                puedes ignorar este mensaje.
                            </p>

                        </div>

                    </div>

                </body>
                </html>
                """.formatted(verificationUrl);

        send(
                email,
                "Verifica tu cuenta de AgroMarket",
                html);
    }

    @Override
    public void sendPasswordResetEmail(
            String email,
            String token) {

        validateEmail(email);
        validateToken(token);

        String html = """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                    <title>Recuperación de contraseña</title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f4f7f4;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                    <div style="
                        max-width:680px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:18px;
                        overflow:hidden;
                        box-shadow:0 8px 30px rgba(0,0,0,.08);
                    ">

                        <div style="
                            background:#176b32;
                            padding:42px;
                            color:white;
                        ">

                            <div style="
                                font-size:14px;
                                letter-spacing:3px;
                                font-weight:bold;
                                margin-bottom:18px;
                            ">
                                AGROMARKET
                            </div>

                            <h1 style="
                                margin:0;
                                font-size:32px;
                            ">
                                Recuperación de contraseña
                            </h1>

                        </div>

                        <div style="
                            padding:40px;
                            color:#17351f;
                        ">

                            <p style="
                                font-size:17px;
                                line-height:1.7;
                            ">
                                Hola, recibimos una solicitud para
                                restablecer tu contraseña.
                            </p>

                            <p style="
                                font-size:16px;
                                line-height:1.7;
                            ">
                                Tu código de recuperación es:
                            </p>

                            <div style="
                                margin:28px 0;
                                padding:22px;
                                background:#f3f5f3;
                                border-radius:12px;
                                text-align:center;
                            ">

                                <span style="
                                    font-size:38px;
                                    font-weight:bold;
                                    letter-spacing:12px;
                                    color:#176b32;
                                ">
                                    %s
                                </span>

                            </div>

                            <p style="
                                font-size:15px;
                                color:#526158;
                                line-height:1.6;
                            ">
                                Este código es válido durante
                                <strong>15 minutos</strong>.
                            </p>

                            <p style="
                                font-size:14px;
                                color:#718078;
                                line-height:1.6;
                                margin-top:28px;
                            ">
                                Si no solicitaste recuperar tu contraseña,
                                puedes ignorar este correo.
                            </p>

                        </div>

                    </div>

                </body>
                </html>
                """.formatted(token);

        send(
                email,
                "Código de recuperación - AgroMarket",
                html);
    }

    private void send(
            String email,
            String subject,
            String html) {

        send(email, subject, html, null, null);
    }

    @Override
    public void sendInvoiceEmail(
            String email,
            String subject,
            String htmlContent,
            String attachmentName,
            byte[] attachment) {

        send(email, subject, htmlContent, attachmentName, attachment);
    }

    private void send(
            String email,
            String subject,
            String html,
            String attachmentName,
            byte[] attachment) {

        if (properties == null) {
            throw new IllegalStateException(
                    "La configuración de Brevo no está disponible");
        }

        String apiKey = properties.getApi() == null
                ? null
                : properties.getApi().getKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "brevo.api.key es obligatorio");
        }

        if (properties.getSender() == null) {
            throw new IllegalStateException(
                    "brevo.sender es obligatorio");
        }

        String senderEmail = properties.getSender().getEmail();

        String senderName = properties.getSender().getName();

        if (senderEmail == null || senderEmail.isBlank()) {
            throw new IllegalStateException(
                    "brevo.sender.email es obligatorio");
        }

        if (senderName == null || senderName.isBlank()) {
            senderName = "AgroMarket";
        }

        var bodyBuilder = new java.util.HashMap<String, Object>();

        bodyBuilder.put("sender",
                Map.of(
                        "name",
                        senderName,
                        "email",
                        senderEmail));

        bodyBuilder.put("to",
                List.of(
                        Map.of(
                                "email",
                                email)));

        bodyBuilder.put("subject", subject);

        bodyBuilder.put("htmlContent", html);

        /*
         * Adjunto REAL (API Brevo v3): el contenido va en Base64. Esto es lo
         * que hace que la factura llegue de verdad al correo del comprador.
         */
        if (attachment != null && attachment.length > 0
                && attachmentName != null && !attachmentName.isBlank()) {

            bodyBuilder.put("attachment",
                    List.of(
                            Map.of(
                                    "name", attachmentName,
                                    "content",
                                    java.util.Base64.getEncoder()
                                            .encodeToString(attachment))));
        }

        restClient.post()
                .uri(BREVO_ENDPOINT)
                .header("api-key", apiKey)
                .header("Content-Type", "application/json")
                .body(bodyBuilder)
                .retrieve()
                .toBodilessEntity();
    }

    private void validateEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "El email destinatario es obligatorio");
        }
    }

    private void validateToken(String token) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "El código/token es obligatorio");
        }
    }

    private String buildVerificationUrl(
            String token) {

        /*
         * La URL del frontend viene de app.frontend-url (centralizado)
         * que usa la variable de entorno FRONTEND_URL.
         * En producción debe apuntar a https://www.agro-market.app
         * o la URL pública del frontend.
         * Fallback a localhost solo aplica en desarrollo sin configuración.
         */
        return frontendUrl + "/verify-email?token="
                + token;
    }
}