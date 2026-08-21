package com.agromarket.infrastructure.security;

import java.math.BigDecimal;
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
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;

@Component
public class MercadoPagoPaymentGatewayAdapter implements PaymentGatewayPort {

        private static final Logger logger = LoggerFactory.getLogger(MercadoPagoPaymentGatewayAdapter.class);

        private final String baseUrl;
        private final String accessToken;
        private final RestTemplate restTemplate;
        private final boolean useMock;

        public MercadoPagoPaymentGatewayAdapter(
                        @Value("${app.mercadopago.base-url:https://api.mercadopago.com}") String baseUrl,
                        @Value("${app.mercadopago.access-token:}") String accessToken,
                        @Value("${app.mercadopago.use-mock:false}") boolean useMock) {

                this.baseUrl = baseUrl;
                this.accessToken = accessToken;
                this.restTemplate = new RestTemplate();
                this.useMock = useMock || accessToken == null || accessToken.isBlank();

                if (this.useMock) {
                        logger.warn("MercadoPago adapter running in MOCK mode. Set app.mercadopago.access-token to use real API.");
                } else {
                        logger.info("MercadoPago adapter configured with real API endpoint: {}", baseUrl);
                }
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
                String checkoutUrl = baseUrl + "/checkout/mock/" + reference;
                return new PaymentInitiationResult(checkoutUrl, reference);
        }

        private PaymentInitiationResult createRealInitiation(Payment payment) {
                try {
                        // Crear preferencia de pago en MercadoPago
                        Map<String, Object> preference = buildPreference(payment);

                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        headers.set("Content-Type", "application/json");

                        HttpEntity<Map<String, Object>> request = new HttpEntity<>(preference, headers);

                        String url = baseUrl + "/checkout/preferences";
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.POST, request,
                                        (Class<Map<String, Object>>) (Class<?>) Map.class);

                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody == null || !responseBody.containsKey("id")) {
                                throw new IllegalStateException(
                                                "Respuesta inválida de MercadoPago: " + responseBody);
                        }

                        String preferenceId = (String) responseBody.get("id");
                        String sandboxUrl = (String) responseBody.get("sandbox_init_point");
                        String productionUrl = (String) responseBody.get("init_point");

                        // Usar sandbox si estamos en desarrollo, producción si es el URL de producción
                        String checkoutUrl = (baseUrl.contains("sandbox") || baseUrl.contains("localhost"))
                                        ? sandboxUrl
                                        : productionUrl;

                        if (checkoutUrl == null || checkoutUrl.isBlank()) {
                                checkoutUrl = baseUrl + "/checkout/preferences/" + preferenceId + "/sandbox";
                        }

                        logger.info("MercadoPago preference created: {}", preferenceId);

                        return new PaymentInitiationResult(checkoutUrl, preferenceId);

                } catch (Exception e) {
                        logger.error("Error al crear preferencia de MercadoPago: " + e.getMessage(), e);
                        throw new IllegalStateException(
                                        "Error al conectar con MercadoPago: " + e.getMessage(), e);
                }
        }

        private Map<String, Object> buildPreference(Payment payment) {
                Map<String, Object> preference = new HashMap<>();

                // Configuración básica
                preference.put("external_reference", "AGROMARKET-" + payment.getId());
                preference.put("statement_descriptor", "AgroMarket");

                // Items del pago (basado en el pedido)
                List<Map<String, Object>> items = new ArrayList<>();

                // AgroMarket modela cada Order como un único producto/cantidad
                // (no una lista de items), así que el pedido se traduce en un
                // único ítem de MercadoPago.
                if (payment.getOrder() != null && payment.getOrder().getProduct() != null) {
                        var order = payment.getOrder();
                        Map<String, Object> mpItem = new HashMap<>();
                        mpItem.put("title", order.getProduct().getName() != null ? order.getProduct().getName()
                                        : "Producto");
                        mpItem.put("description", truncate(order.getProduct().getDescription(), 250));
                        mpItem.put("quantity", order.getQuantity() != null ? order.getQuantity() : 1);
                        BigDecimal unitPrice = order.getUnitPrice() != null ? order.getUnitPrice()
                                        : payment.getAmount();
                        mpItem.put("unit_price", unitPrice.doubleValue());
                        mpItem.put("currency_id", "COP");
                        items.add(mpItem);
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

                // Especificar método de pago preferido (PSE, tarjetas, etc.)
                // Esto es opcional pero ayuda a MercadoPago a pre-seleccionar el método
                if (payment.getPaymentMethod() != null) {
                        String paymentType = mapPaymentMethodToMP(payment.getPaymentMethod());
                        if (paymentType != null) {
                                preference.put("payment_methods", Map.of(
                                                "excluded_types", List.of(
                                                                Map.of("id", paymentType))));
                        }
                }

                // Back URLs (URLs de retorno)
                Map<String, String> backUrls = new HashMap<>();
                backUrls.put("success", "http://localhost:5173/pago/exitoso?preference_id={preference_id}");
                backUrls.put("failure", "http://localhost:5173/pago/fallido");
                backUrls.put("pending", "http://localhost:5173/pago/pendiente");
                preference.put("back_urls", backUrls);

                // Auto-return para redirección automática
                preference.put("auto_return", "approved");

                // Expiración de la preferencia (24 horas)
                preference.put("expires", true);
                preference.put("expiration_date_to",
                                java.time.Instant.now().plusSeconds(86400).toString());

                // Configuración específica para Colombia (PSE y tarjetas locales)
                preference.put("country", "CO");
                preference.put("locale", "es-CO");

                return preference;
        }

        /**
         * Mapea el método de pago de AgroMarket al formato de MercadoPago
         */
        private String mapPaymentMethodToMP(com.agromarket.domain.models.enums.payment.PaymentMethod method) {
                if (method == null)
                        return null;

                switch (method) {
                        case CREDIT_CARD:
                                return "credit_card";
                        case DEBIT_CARD:
                                return "debit_card";
                        case PSE:
                                return "bank_transfer";
                        case CASH:
                                return "cash";
                        default:
                                return null;
                }
        }

        private String truncate(String text, int maxLength) {
                if (text == null) {
                        return "";
                }
                return text.length() > maxLength ? text.substring(0, maxLength) : text;
        }

        @Override
        public boolean verifyTransaction(
                        String gatewayReference) {

                if (useMock) {
                        return gatewayReference != null && gatewayReference.startsWith("MOCK-MP-");
                }

                return verifyRealTransaction(gatewayReference);
        }

        private boolean verifyRealTransaction(String preferenceId) {
                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);
                        headers.set("Content-Type", "application/json");

                        HttpEntity<String> request = new HttpEntity<>(headers);

                        // Consultar el estado de la preferencia/pago
                        String url = baseUrl + "/checkout/preferences/" + preferenceId;
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.GET, request,
                                        (Class<Map<String, Object>>) (Class<?>) Map.class);

                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody == null) {
                                logger.error("Respuesta nula de MercadoPago al verificar transacción: {}",
                                                preferenceId);
                                return false;
                        }

                        // Verificar si el pago fue completado
                        String status = (String) responseBody.get("status");
                        if ("approved".equals(status) || "paid".equals(status)) {
                                logger.info("Transacción verificada exitosamente: {}", preferenceId);
                                return true;
                        }

                        logger.warn("Transacción no completada. Estado: {}", status);
                        return false;

                } catch (Exception e) {
                        logger.error("Error al verificar transacción en MercadoPago: " + e.getMessage(), e);
                        return false;
                }
        }

        @Override
        public BigDecimal getTransactionAmount(String gatewayReference) {
                if (useMock) {
                        return BigDecimal.ZERO;
                }

                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", "Bearer " + accessToken);

                        HttpEntity<String> request = new HttpEntity<>(headers);

                        String url = baseUrl + "/checkout/preferences/" + gatewayReference;
                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        url, HttpMethod.GET, request,
                                        (Class<Map<String, Object>>) (Class<?>) Map.class);

                        Map<String, Object> responseBody = response.getBody();
                        if (responseBody == null) {
                                return BigDecimal.ZERO;
                        }

                        // Obtener el monto total de la preferencia
                        Object totalAmountObj = responseBody.get("total_amount");
                        if (totalAmountObj instanceof Number) {
                                Number totalAmount = (Number) totalAmountObj;
                                return BigDecimal.valueOf(totalAmount.doubleValue());
                        }

                        return BigDecimal.ZERO;
                } catch (Exception e) {
                        logger.error("Error al obtener monto de transacción: " + e.getMessage(), e);
                        return BigDecimal.ZERO;
                }
        }
}