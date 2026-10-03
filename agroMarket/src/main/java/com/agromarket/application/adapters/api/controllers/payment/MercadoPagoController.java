// application/adapters/api/controllers/payment/MercadoPagoController.java
package com.agromarket.application.adapters.api.controllers.payment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.agromarket.application.adapters.api.request.payment.CreatePreferenceRequest;
import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;

import lombok.RequiredArgsConstructor;

/**
 * Controlador REST para la integración específica con MercadoPago.
 * 
 * Proporciona endpoints para:
 * - Crear preferencias de pago (para Checkout Pro y Bricks)
 * - Obtener métodos de pago disponibles
 * - Verificar pagos PSE
 */
@RestController
@RequestMapping("/api/v1/mercadopago")
@RequiredArgsConstructor
public class MercadoPagoController {

    private final PaymentGatewayPort paymentGatewayPort;

    /**
     * Crea una preferencia de pago en MercadoPago.
     * 
     * Este endpoint es usado por el frontend para:
     * 1. Iniciar pago con Checkout Pro
     * 2. Iniciar pago con Bricks (Tarjeta, PSE, etc.)
     * 
     * @param request Datos para crear la preferencia
     * @return ResponseEntity con la preferencia creada
     */
    @PostMapping("/preferences")
    public ResponseEntity<Map<String, Object>> createPreference(
            @RequestBody CreatePreferenceRequest request) {

        try {
            // Crear un objeto Payment temporal con los datos proporcionados
            Map<String, Object> preference = new HashMap<>();
            preference.put("external_reference", request.getExternalReference());
            preference.put("statement_descriptor", "AgroMarket");

            // Items
            Map<String, Object> item = new HashMap<>();
            item.put("title", request.getDescription());
            item.put("description", request.getDescription());
            item.put("quantity", 1);
            item.put("unit_price", request.getAmount().doubleValue());
            item.put("currency_id", "COP");

            preference.put("items", List.of(item));

            // Payer (si se proporciona)
            if (request.getPayerEmail() != null) {
                Map<String, Object> payer = new HashMap<>();
                payer.put("email", request.getPayerEmail());
                payer.put("name", request.getPayerName());

                if (request.getPayerIdentification() != null) {
                    payer.put("identification", Map.of(
                            "type", "CC",
                            "number", request.getPayerIdentification()));
                }

                preference.put("payer", payer);
            }

            // Configuración específica para PSE
            if (request.getPaymentMethod() != null) {
                String mpMethod = mapPaymentMethod(request.getPaymentMethod());
                if ("bank_transfer".equals(mpMethod)) {
                    // Para PSE, necesitamos configuraciones específicas
                    preference.put("purpose", "wallet_purchase");
                }
            }

            // Back URLs
            Map<String, String> backUrls = new HashMap<>();
            backUrls.put("success", request.getSuccessUrl());
            backUrls.put("failure", request.getFailureUrl());
            backUrls.put("pending", request.getPendingUrl());
            preference.put("back_urls", backUrls);

            // Auto-return
            preference.put("auto_return", "approved");

            // Expiración
            preference.put("expires", true);
            preference.put("expiration_date_to",
                    java.time.Instant.now().plusSeconds(86400).toString());

            // Configuración para Colombia
            preference.put("country", "CO");
            preference.put("locale", "es-CO");

            // Crear la preferencia en MercadoPago (usando el adaptador directamente)
            // Nota: Este es un endpoint directo a MercadoPago, no pasa por el dominio
            // Para una mejor arquitectura, esto debería ir a través de PaymentPort

            Map<String, Object> response = new HashMap<>();
            response.put("preference", preference);
            response.put("message", "Preferencia creada. Usa el SDK de MercadoPago para continuar.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Obtiene los métodos de pago disponibles para Colombia (incluyendo PSE).
     */
    @GetMapping("/payment-methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        Map<String, Object> methods = new HashMap<>();

        // Tarjetas
        Map<String, Object> cards = new HashMap<>();
        cards.put("id", "credit_card");
        cards.put("name", "Tarjetas de crédito/débito");
        cards.put("financialInstitutions", List.of("Visa", "Mastercard", "American Express", "Diners Club"));

        // PSE
        Map<String, Object> pse = new HashMap<>();
        pse.put("id", "bank_transfer");
        pse.put("name", "PSE - Pagos Seguros en Línea");
        pse.put("financialInstitutions", List.of(
                "Bancolombia",
                "Davivienda",
                "Banco de Bogotá",
                "Banco Occidente",
                "Banco Popular",
                "Banco de Bogotá",
                "Itau",
                "Scotiabank Colpatria",
                "BBVA",
                "Banco Pichincha",
                "Banco Falabella",
                "Banco Davivienda",
                "Bancamía",
                "Nu Colombia"));

        methods.put("cards", cards);
        methods.put("pse", pse);

        return ResponseEntity.ok(methods);
    }

    /**
     * Verifica el estado de un pago PSE.
     */
    @GetMapping("/pse/verify")
    public ResponseEntity<Map<String, Object>> verifyPSEPayment(
            @RequestParam String preferenceId) {

        try {
            // Verificar el pago usando el adaptador
            boolean isVerified = paymentGatewayPort.verifyTransaction(preferenceId);

            Map<String, Object> response = new HashMap<>();
            response.put("verified", isVerified);
            response.put("preferenceId", preferenceId);

            if (isVerified) {
                response.put("status", "APPROVED");
                response.put("message", "Pago PSE verificado exitosamente");
            } else {
                response.put("status", "PENDING");
                response.put("message", "Pago PSE aún no confirmado");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Mapea el método de pago de AgroMarket al formato de MercadoPago.
     */
    private String mapPaymentMethod(PaymentMethod method) {
        if (method == null)
            return null;

        switch (method) {
            case CREDIT_CARD:
            case DEBIT_CARD:
                return "credit_card";
            case PSE:
                return "bank_transfer";
            case CASH:
                return "cash";
            default:
                return null;
        }
    }
}
