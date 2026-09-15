package com.agromarket.infrastructure.security;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import com.agromarket.domain.models.order.OrderItem;
import com.agromarket.domain.models.payment.CardPaymentDetails;
import com.agromarket.domain.models.payment.GatewayPaymentInfo;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;

/**
 * Adaptador REAL de la pasarela MercadoPago contra la API pública
 * (https://api.mercadopago.com):
 *
 * <ul>
 *   <li>POST /checkout/preferences — preferencia de Checkout Pro (tarjetas,
 *       PSE y todos los métodos disponibles en Colombia).</li>
 *   <li>GET /v1/payments/{id} — consulta un pago real por su ID
 *       (callback/webhook) para verificarlo antes de confirmar.</li>
 *   <li>GET /v1/payments/search?external_reference=... — busca el pago de
 *       MercadoPago asociado a un pago local.</li>
 *   <li>POST /v1/payments — crea el pago con tarjeta a partir del token del
 *       Card Payment Brick (server-side).</li>
 * </ul>
 *
 * <p>
 * Si no hay access token configurado (o MERCADOPAGO_USE_MOCK=true), opera en
 * modo MOCK para desarrollo sin credenciales.
 * </p>
 */
@Component
public class MercadoPagoPaymentGatewayAdapter implements PaymentGatewayPort {

        private static final Logger logger = LoggerFactory.getLogger(MercadoPagoPaymentGatewayAdapter.class);

        /** Prefijo de la external_reference que vincula pagos locales con MercadoPago. */
        public static final String EXTERNAL_REFERENCE_PREFIX = GatewayPaymentInfo.EXTERNAL_REFERENCE_PREFIX;

        private final String baseUrl;
        private final String accessToken;
        private final RestTemplate restTemplate;
        private final boolean useMock;
        private final String frontendUrl;
        private final String webhookUrl;

        public MercadoPagoPaymentGatewayAdapter(
                        @Value("${app.mercadopago.base-url:https://api.mercadopago.com}") String baseUrl,
                        @Value("${app.mercadopago.access-token:}") String accessToken,
                        @Value("${app.mercadopago.use-mock:false}") boolean useMock,
                        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
                        @Value("${app.mercadopago.webhook-url:}") String webhookUrl) {

                this.baseUrl = baseUrl;
                this.accessToken = accessToken;
                this.frontendUrl = frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "http://localhost:5173";
                this.webhookUrl = webhookUrl != null && !webhookUrl.isBlank() ? webhookUrl : null;
                this.restTemplate = buildRestTemplate();
                this.useMock = useMock || accessToken == null || accessToken.isBlank();

                if (this.useMock) {
                        logger.warn("MercadoPago adapter running in MOCK mode. Set app.mercadopago.access-token to use real API.");
                } else {
                        logger.info("MercadoPago adapter configured with real API endpoint: {}", baseUrl);
                }
        }

        private RestTemplate buildRestTemplate() {
                SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
                factory.setReadTimeout((int) Duration.ofSeconds(15).toMillis());
                return new RestTemplate(factory);
        }

        @Override
        public PaymentInitiationResult initiate(
                        Payment payment) {

                if (payment == null) {
                        throw new IllegalArgumentException(
                                        "El pago es obligatorio");
                }

                if (useMock) {
                        return createMockInitiation(payment);
                }

                return createRealInitiation(payment);
        }

        private PaymentInitiationResult createMockInitiation(Payment payment) {
                String reference = "MOCK-MP-" + UUID.randomUUID();
                Long paymentId = payment.getId();
                // En modo mock el "checkout" apunta a la página de resultado del
                // frontend para poder completar el flujo sin credenciales reales.
                String checkoutUrl = paymentId != null
                                ? frontendUrl + "/pago/exitoso?pagoId=" + paymentId
                                : frontendUrl + "/pago/exitoso";
                return new PaymentInitiationResult(checkoutUrl, reference, paymentId);
        }

        private PaymentInitiationResult createRealInitiation(Payment payment) {
                try {
                        // Crear preferencia de pago en MercadoPago
                        Map<String, Object> preference = buildPreference(payment);

                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> request = new HttpEntity<>(preference, headers);

                        String url = baseUrl + "/checkout/preferences";
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.POST, request,
                                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody == null || responseBody.get("id") == null) {
                                throw new IllegalStateException(
                                                "Respuesta inválida de MercadoPago: " + responseBody);
                        }

                        String preferenceId = String.valueOf(responseBody.get("id"));
                        String initPoint = (String) responseBody.get("init_point");
                        String sandboxInitPoint = (String) responseBody.get("sandbox_init_point");

                        /*
                         * Tokens APP_USR -> credenciales productivas -> init_point.
                         * Tokens TEST-  -> credenciales de prueba  -> sandbox_init_point.
                         */
                        String checkoutUrl = accessToken.startsWith("TEST-")
                                        ? sandboxInitPoint
                                        : initPoint;

                        if (checkoutUrl == null || checkoutUrl.isBlank()) {
                                checkoutUrl = initPoint != null ? initPoint : sandboxInitPoint;
                        }

                        if (checkoutUrl == null || checkoutUrl.isBlank()) {
                                throw new IllegalStateException(
                                                "MercadoPago no devolvió URL de checkout para la preferencia "
                                                                + preferenceId);
                        }

                        logger.info("MercadoPago preference created: {}", preferenceId);

                        return new PaymentInitiationResult(checkoutUrl, preferenceId, payment.getId());

                } catch (HttpStatusCodeException e) {
                        logger.error("Error HTTP {} al crear preferencia de MercadoPago: {}",
                                        e.getStatusCode(), e.getResponseBodyAsString());
                        throw new IllegalStateException(
                                        describeGatewayError("crear la preferencia de pago", e), e);
                } catch (RuntimeException e) {
                        logger.error("Error al crear preferencia de MercadoPago: " + e.getMessage(), e);
                        throw new IllegalStateException(
                                        "Error al conectar con MercadoPago: " + e.getMessage(), e);
                }
        }

        /**
         * Traduce los errores HTTP de la API de MercadoPago a mensajes
         * claros: un 401/403 significa credenciales inválidas o expiradas
         * (MERCADOPAGO_ACCESS_TOKEN), NO un problema del comprador.
         */
        private static String describeGatewayError(String action, HttpStatusCodeException e) {

                int status = e.getStatusCode().value();
                String body = e.getResponseBodyAsString();

                if (status == 401 || status == 403) {
                        return "MercadoPago rechazó las credenciales del servidor (HTTP "
                                        + status + ") al " + action + ". "
                                        + "El MERCADOPAGO_ACCESS_TOKEN está inválido o expirado: "
                                        + "genera unas nuevas en https://developers.mercadopago.com y "
                                        + "actualiza el archivo .env del backend. Detalle: " + body;
                }

                return "Error HTTP " + status + " de MercadoPago al " + action
                                + ": " + body;
        }

        /**
         * Traduce un ítem del pedido ({@link OrderItem}) a un ítem de la
         * preferencia de MercadoPago.
         *
         * @param item           ítem del pedido
         * @param fallbackAmount monto del pago usado si el ítem no trae precio
         * @return el ítem en el formato que espera la API de MercadoPago
         */
        private Map<String, Object> toMercadoPagoItem(OrderItem item, BigDecimal fallbackAmount) {

                Product product = item == null ? null : item.getProduct();

                Map<String, Object> mpItem = new HashMap<>();
                mpItem.put("title", product != null && product.getName() != null
                                ? product.getName()
                                : "Producto");
                mpItem.put("description", truncate(
                                product != null ? product.getDescription() : null, 250));
                mpItem.put("quantity", item != null && item.getQuantity() != null
                                ? item.getQuantity()
                                : 1);

                BigDecimal unitPrice = item != null && item.getUnitPrice() != null
                                ? item.getUnitPrice()
                                : (item != null ? item.calculateSubtotal() : null);

                if (unitPrice == null) {
                        unitPrice = fallbackAmount != null ? fallbackAmount : BigDecimal.ZERO;
                }

                mpItem.put("unit_price", unitPrice.doubleValue());
                mpItem.put("currency_id", "COP");
                return mpItem;
        }

        private Map<String, Object> buildPreference(Payment payment) {
                Map<String, Object> preference = new HashMap<>();

                // Configuración básica
                preference.put("external_reference", "AGROMARKET-" + payment.getId());
                preference.put("statement_descriptor", "AgroMarket");

                // Items del pago (basado en el pedido)
                List<Map<String, Object>> items = new ArrayList<>();

                // Un ítem de la preferencia por cada OrderItem del pedido.
                var order = payment.getOrder();

                if (order != null && order.getItems() != null && !order.getItems().isEmpty()) {
                        for (OrderItem item : order.getItems()) {
                                items.add(toMercadoPagoItem(item, payment.getAmount()));
                        }
                } else {
                        // Si no hay pedido, creamos un item genérico
                        Map<String, Object> mpItem = new HashMap<>();
                        mpItem.put("title", "Pago en AgroMarket");
                        mpItem.put("description", "Compra de productos agrícolas");
                        mpItem.put("quantity", 1);
                        mpItem.put("unit_price", payment.getAmount().doubleValue());
                        mpItem.put("currency_id", "COP");
                        items.add(mpItem);
                }

                preference.put("items", items);

                // Payer (información del comprador)
                if (payment.getOrder() != null && payment.getOrder().getBuyer() != null) {
                        Map<String, Object> payer = new HashMap<>();
                        payer.put("email", payment.getOrder().getBuyer().getEmail());
                        payer.put("name", payment.getOrder().getBuyer().getFirstName() + " " +
                                        payment.getOrder().getBuyer().getLastName());
                        payer.put("phone", payment.getOrder().getBuyer().getPhone());

                        // Agregar identificación para PSE (requerido para Colombia)
                        String idNumber = payment.getOrder().getBuyer().getIdNumber();
                        if (idNumber != null && !idNumber.isBlank()) {
                                String idType = payment.getOrder().getBuyer().getIdType();
                                payer.put("identification", Map.of(
                                                "type", idType != null && !idType.isBlank() ? idType : "CC",
                                                "number", idNumber));
                        }

                        preference.put("payer", payer);
                }

                // Back URLs (URLs de retorno al frontend después de pagar).
                // Son rutas reales registradas en el router del frontend.
                Map<String, String> backUrls = new HashMap<>();
                backUrls.put("success", frontendUrl + "/pago/exitoso");
                backUrls.put("failure", frontendUrl + "/pago/fallido");
                backUrls.put("pending", frontendUrl + "/pago/pendiente");
                preference.put("back_urls", backUrls);

                // Redirección automática al frontend cuando el pago es aprobado
                preference.put("auto_return", "approved");

                // Webhook server-to-server (solo si se configuró una URL pública)
                if (webhookUrl != null) {
                        preference.put("notification_url", webhookUrl);
                }

                // Expiración de la preferencia (24 horas, ISO-8601 con offset,
                // formato exigido por MercadoPago)
                preference.put("expires", true);
                preference.put("expiration_date_to",
                                OffsetDateTime.now(ZoneOffset.of("-05:00")).plusHours(24)
                                                .format(DateTimeFormatter.ofPattern(
                                                                "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")));

                return preference;
        }

        private String truncate(String text, int maxLength) {
                if (text == null) {
                        return "";
                }
                return text.length() > maxLength ? text.substring(0, maxLength) : text;
        }

        // ==================================================================
        // VERIFICACIÓN DE PAGOS
        // ==================================================================

        @Override
        public boolean verifyTransaction(String gatewayReference) {

                if (useMock) {
                        return gatewayReference != null && gatewayReference.startsWith("MOCK-");
                }

                if (gatewayReference == null || gatewayReference.isBlank()) {
                        return false;
                }

                /*
                 * Un ID de pago de MercadoPago es numérico (viene del callback o
                 * del webhook). En ese caso se consulta el pago directamente.
                 */
                GatewayPaymentInfo info = isNumeric(gatewayReference)
                                ? fetchGatewayPayment(gatewayReference)
                                : null;

                if (info != null && info.isApproved()) {
                        logger.info("Transacción verificada exitosamente en MercadoPago: {} (status={})",
                                        gatewayReference, info.getStatus());
                        return true;
                }

                logger.warn("Transacción no aprobada en MercadoPago. Referencia={} status={}",
                                gatewayReference, info != null ? info.getStatus() : "desconocido");

                return false;
        }

        @Override
        public GatewayPaymentInfo fetchGatewayPayment(String gatewayPaymentId) {

                if (useMock) {
                        return new GatewayPaymentInfo(
                                        gatewayPaymentId, "approved", "mock",
                                        null, BigDecimal.ZERO);
                }

                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        HttpEntity<String> request = new HttpEntity<>(headers);

                        String url = baseUrl + "/v1/payments/" + gatewayPaymentId;
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.GET, request,
                                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

                        return toGatewayPaymentInfo(response.getBody());

                } catch (HttpStatusCodeException e) {
                        logger.error("Error HTTP {} consultando pago {}: {}",
                                        e.getStatusCode(), gatewayPaymentId, e.getResponseBodyAsString());
                        return null;
                } catch (RuntimeException e) {
                        logger.error("Error consultando pago en MercadoPago {}: {}",
                                        gatewayPaymentId, e.getMessage(), e);
                        return null;
                }
        }

        @Override
        public GatewayPaymentInfo findLatestByExternalReference(String externalReference) {

                if (useMock || externalReference == null || externalReference.isBlank()) {
                        return null;
                }

                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        HttpEntity<String> request = new HttpEntity<>(headers);

                        String url = baseUrl + "/v1/payments/search"
                                        + "?external_reference=" + externalReference
                                        + "&sort=date_created&criteria=desc";
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.GET, request,
                                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

                        Map<String, Object> body = response.getBody();
                        if (body == null
                                        || !(body.get("results") instanceof List<?> results)
                                        || results.isEmpty()) {
                                return null;
                        }

                        Object first = results.get(0);
                        if (first instanceof Map<?, ?> firstMap) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> paymentMap = (Map<String, Object>) firstMap;
                                return toGatewayPaymentInfo(paymentMap);
                        }
                        return null;

                } catch (RuntimeException e) {
                        logger.error("Error buscando pagos por external_reference {}: {}",
                                        externalReference, e.getMessage(), e);
                        return null;
                }
        }

        /**
         * Convierte el JSON de un pago de MercadoPago (/v1/payments) a
         * GatewayPaymentInfo.
         */
        private GatewayPaymentInfo toGatewayPaymentInfo(Map<String, Object> paymentMap) {
                if (paymentMap == null) {
                        return null;
                }

                String id = paymentMap.get("id") != null ? String.valueOf(paymentMap.get("id")) : null;
                String status = paymentMap.get("status") != null ? String.valueOf(paymentMap.get("status")) : null;
                String statusDetail = paymentMap.get("status_detail") != null
                                ? String.valueOf(paymentMap.get("status_detail"))
                                : null;

                String externalReference = paymentMap.get("external_reference") != null
                                ? String.valueOf(paymentMap.get("external_reference"))
                                : null;

                BigDecimal amount = BigDecimal.ZERO;
                if (paymentMap.get("transaction_amount") instanceof Number amountNumber) {
                        amount = BigDecimal.valueOf(amountNumber.doubleValue());
                }

                return new GatewayPaymentInfo(id, status, statusDetail, externalReference, amount);
        }

        // ==================================================================
        // PAGO CON TARJETA (Card Payment Brick, server-side)
        // ==================================================================

        @Override
        public GatewayPaymentInfo createCardPayment(Payment payment, CardPaymentDetails details) {

                if (details == null || details.getToken() == null || details.getToken().isBlank()) {
                        throw new IllegalArgumentException("El token de la tarjeta es obligatorio");
                }

                if (useMock) {
                        String mockId = "MOCK-PAY-" + UUID.randomUUID();
                        return new GatewayPaymentInfo(
                                        mockId, "approved", "mock",
                                        EXTERNAL_REFERENCE_PREFIX + (payment != null ? payment.getId() : null),
                                        payment != null && payment.getAmount() != null
                                                        ? payment.getAmount()
                                                        : BigDecimal.ZERO);
                }

                try {
                        Map<String, Object> body = new HashMap<>();
                        body.put("transaction_amount",
                                        payment.getAmount() != null ? payment.getAmount().doubleValue() : 0);
                        body.put("token", details.getToken());
                        body.put("description",
                                        "Pedido AgroMarket #"
                                                        + (payment.getOrder() != null ? payment.getOrder().getId() : ""));
                        body.put("installments", details.getInstallments());
                        if (details.getPaymentMethodId() != null && !details.getPaymentMethodId().isBlank()) {
                                body.put("payment_method_id", details.getPaymentMethodId());
                        }
                        if (details.getIssuerId() != null && !details.getIssuerId().isBlank()) {
                                body.put("issuer_id", details.getIssuerId());
                        }

                        Map<String, Object> payer = new HashMap<>();
                        if (details.getPayerEmail() != null && !details.getPayerEmail().isBlank()) {
                                payer.put("email", details.getPayerEmail());
                        } else if (payment.getOrder() != null
                                        && payment.getOrder().getBuyer() != null
                                        && payment.getOrder().getBuyer().getEmail() != null) {
                                payer.put("email", payment.getOrder().getBuyer().getEmail());
                        }
                        body.put("payer", payer);

                        if (payment.getId() != null) {
                                body.put("external_reference",
                                                EXTERNAL_REFERENCE_PREFIX + payment.getId());
                        }

                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        baseUrl + "/v1/payments", HttpMethod.POST, request,
                                        new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

                        GatewayPaymentInfo info = toGatewayPaymentInfo(response.getBody());
                        logger.info("MercadoPago card payment created: id={} status={}",
                                        info != null ? info.getGatewayPaymentId() : null,
                                        info != null ? info.getStatus() : null);
                        return info;

                } catch (HttpStatusCodeException e) {
                        logger.error("Error HTTP {} creando pago con tarjeta: {}",
                                        e.getStatusCode(), e.getResponseBodyAsString());
                        throw new IllegalStateException(
                                        describeGatewayError("procesar el pago con tarjeta", e), e);
                } catch (RuntimeException e) {
                        logger.error("Error creando pago con tarjeta en MercadoPago: " + e.getMessage(), e);
                        throw new IllegalStateException(
                                        "Error al conectar con MercadoPago: " + e.getMessage(), e);
                }
        }

        // ==================================================================
        // HELPERS
        // ==================================================================

        @Override
        public BigDecimal getTransactionAmount(String gatewayReference) {

                if (useMock) {
                        return BigDecimal.ZERO;
                }

                if (gatewayReference == null || gatewayReference.isBlank() || !isNumeric(gatewayReference)) {
                        return BigDecimal.ZERO;
                }

                GatewayPaymentInfo info = fetchGatewayPayment(gatewayReference);

                return info != null && info.getAmount() != null ? info.getAmount() : BigDecimal.ZERO;
        }

        private boolean isNumeric(String value) {
                if (value == null || value.isBlank()) {
                        return false;
                }
                for (char c : value.toCharArray()) {
                        if (!Character.isDigit(c)) {
                                return false;
                        }
                }
                return true;
        }
}