package com.agromarket.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Verifica la firma que MercadoPago envia en sus webhooks.
 *
 * <p>El webhook es público a proposito: la pasarela no manda JWT. Sin esta
 * comprobacion, cualquiera que conozca el identificador de un pago podría
 * confirmar cobros que nunca se hicieron:
 *
 * <pre>
 * curl -X POST https://api/…/payments/webhook?id=999
 * </pre>
 *
 * <p>MercadoPago manda dos cabeceras:
 * <ul>
 *   <li>{@code x-signature}: {@code ts=<unix>;v1=<hmac>}</li>
 *   <li>{@code x-request-id}: identificador de la peticion</li>
 * </ul>
 *
 * <p>El HMAC se calcula sobre el manifiesto
 * {@code id:<data.id>;request-id:<x-request-id>;ts:<ts>} usando el secret de
 * la cuenta. Se documenta en
 * <a href="https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications">notificaciones</a>.
 */
public final class MercadoPagoSignatureValidator {

    /** Ventana de tolerancia del reloj, en milisegundos. */
    private static final long MAX_CLOCK_SKEW_MS = 5L * 60L * 1000L;

    private static final String HMAC_SHA256 = "HmacSHA256";

    private MercadoPagoSignatureValidator() {
    }

    /**
     * Comprueba la firma de un evento.
     *
     * @param dataId        identificador del pago notificado ({@code data.id})
     * @param xSignature    cabecera {@code x-signature}
     * @param xRequestId    cabecera {@code x-request-id}
     * @param secret        secret de la cuenta de MercadoPago
     * @return {@code true} si la firma es valida
     */
    public static boolean esValida(
            String dataId,
            String xSignature,
            String xRequestId,
            String secret) {

        if (secret == null || secret.isBlank()) {
            // Sin secret no hay nada contra lo que comparar. Se rechaza: es
            // preferible no procesar un webhook legitimo (que MercadoPago
            // reintentaria) antes que aceptar uno falso.
            return false;
        }
        if (xSignature == null || xSignature.isBlank()) {
            return false;
        }

        String ts = valorDe(xSignature, "ts");
        String v1 = valorDe(xSignature, "v1");
        if (ts == null || v1 == null) {
            return false;
        }

        // Un evento con ts antiguo se podria reutilizar. La ventana de 5
        // minutos es la que documenta MercadoPago.
        try {
            long edad = Math.abs(System.currentTimeMillis()
                    - Long.parseLong(ts) * 1000L);
            if (edad > MAX_CLOCK_SKEW_MS) {
                return false;
            }
        } catch (NumberFormatException ex) {
            return false;
        }

        String manifiesto = "id:" + (dataId == null ? "" : dataId)
                + ";request-id:" + (xRequestId == null ? "" : xRequestId)
                + ";ts:" + ts + ";";

        String esperada = hmacSha256(manifiesto, secret);
        // Constante de tiempo para no filtrar informacion por el tiempo que
        // tarda la comparacion.
        return MessageDigest.isEqual(
                esperada.getBytes(StandardCharsets.UTF_8),
                v1.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extrae un valor de la cabecera de firma.
     *
     * <p>MercadoPago separa los pares con COMA ({@code ts=170…,v1=abc}), no
     * con punto y coma. Se acepta tambien el punto y coma porque la
     * documentacion aparece con ambos formatos segun la version, pero la coma
     * es la que llega de verdad: si se parte solo por ";", el valor de "ts"
     * queda como "170…,v1=abc", no se puede convertir a numero y el webhook
     * rechaza el 100% de los eventos, incluidos los legitimos.
     */
    private static String valorDe(String cabecera, String clave) {
        for (String parte : cabecera.split("[;,]")) {
            String[] kv = parte.trim().split("=", 2);
            if (kv.length == 2 && kv[0].trim().equalsIgnoreCase(clave)) {
                return kv[1].trim();
            }
        }
        return null;
    }

    private static String hmacSha256(String datos, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            StringBuilder hex = new StringBuilder();
            for (byte b : mac.doFinal(datos.getBytes(StandardCharsets.UTF_8))) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | java.security.InvalidKeyException ex) {
            throw new IllegalStateException(
                    "No se pudo calcular el HMAC del webhook", ex);
        }
    }
}