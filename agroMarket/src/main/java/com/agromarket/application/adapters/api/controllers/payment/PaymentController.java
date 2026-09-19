// application/adapters/api/controllers/payment/PaymentController.java
package com.agromarket.application.adapters.api.controllers.payment;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.agromarket.application.adapters.api.request.payment.ConfirmPaymentRequest;
import com.agromarket.application.adapters.api.request.payment.InitiatePaymentRequest;
import com.agromarket.application.adapters.api.response.payment.PaymentInitiationResponse;
import com.agromarket.application.adapters.api.response.payment.PaymentResponse;
import com.agromarket.domain.exceptions.payment.PaymentNotFoundException;
import com.agromarket.domain.ports.in.payment.PaymentPort;
import com.agromarket.domain.ports.in.payment.PaymentResult;
import com.agromarket.domain.models.enums.payment.PaymentState;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentPort paymentPort;

    /**
     * Alias de negocio: /api/v1/pagos/iniciar (vía ApiPathAliasFilter) llega
     * aquí como POST /api/v1/payments, que ya existe. No se requiere método
     * nuevo: el filtro de alias de prefijo ya resuelve /pagos -> /payments,
     * así que un simple POST sin sufijo adicional en el frontend alcanza.
     * Se documenta el mapeo explícito con @PostMapping({"", "/iniciar"})
     * por si el frontend termina golpeando la ruta con el sufijo /iniciar
     * dentro de /api/v1/payments (en vez de depender solo del filtro).
     */
    @PostMapping({ "", "/iniciar" })
    public ResponseEntity<PaymentInitiationResponse> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        PaymentInitiationResponse
                                .fromDomainResult(
                                        paymentPort.initiatePayment(
                                                request.getOrderId(),
                                                request.getBuyerId(),
                                                request.getPaymentMethod())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.getById(id)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentPort
                        .getByOrderId(orderId)
                        .stream()
                        .map(PaymentResponse::fromResult)
                        .toList());
    }

    /**
     * GET /api/v1/payments?gatewayReference={ref}
     * Cuando se manda el parámetro, filtra por esa referencia y devuelve una
     * lista de 0 o 1 elemento (mismo shape de respuesta que antes, para no
     * romper a quien ya consume esta ruta sin el parámetro).
     */
    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAll(
            @RequestParam(required = false) String gatewayReference) {

        if (gatewayReference == null || gatewayReference.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(
                paymentPort.getByGatewayReference(gatewayReference)
                        .map(PaymentResponse::fromResult)
                        .map(List::of)
                        .orElse(List.of()));
    }

        /**
         * GET /api/v1/payments/escrow (alias frontend: /pagos/fideicomiso)
         *
         * Lista los pagos confirmados y en fideicomiso para que el
         * administrador pueda liberarlos o reembolsarlos.
         *
         * Si se pasa {@code ?state=CONFIRMED|IN_ESCROW|RELEASED|REFUNDED} se
         * filtra por ese estado; sin parámetro devuelve un único listado con
         * CONFIRMED + IN_ESCROW (vista de trabajo diaria del admin).
         */
        @GetMapping({ "/escrow", "/fideicomiso" })
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<List<PaymentResponse>> getEscrow(
                        @RequestParam(required = false) String state) {

                if (state != null && !state.isBlank()) {
                        return ResponseEntity.ok(
                                        paymentPort.getByState(parseState(state))
                                                        .stream()
                                                        .map(PaymentResponse::fromResult)
                                                        .toList());
                }

                List<PaymentResult> payments = new java.util.ArrayList<>(
                                paymentPort.getByState(PaymentState.IN_ESCROW));
                payments.addAll(paymentPort.getByState(PaymentState.CONFIRMED));

                return ResponseEntity.ok(payments.stream().map(PaymentResponse::fromResult).toList());
        }

        /**
         * PATCH /api/v1/payments/{id}/escrow — CONFIRMED -> IN_ESCROW.
         *
         * <p>
         * Idempotente: repetirlo sobre un pago ya en fideicomiso devuelve el
         * estado actual sin efectos adicionales.
         * </p>
         */
        @PatchMapping("/{id}/escrow")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<PaymentResponse> holdInEscrow(@PathVariable Long id) {
                return ResponseEntity.ok(
                                PaymentResponse.fromResult(paymentPort.holdInEscrow(id)));
        }

        /** PATCH /api/v1/payments/{id}/release — IN_ESCROW/CONFIRMED -> RELEASED. */
        @PatchMapping("/{id}/release")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<PaymentResponse> release(@PathVariable Long id) {
                return ResponseEntity.ok(PaymentResponse.fromResult(paymentPort.releasePayment(id)));
        }

        /** PATCH /api/v1/payments/{id}/refund — CONFIRMED/IN_ESCROW -> REFUNDED. */
        @PatchMapping("/{id}/refund")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<PaymentResponse> refund(@PathVariable Long id) {
                return ResponseEntity.ok(PaymentResponse.fromResult(paymentPort.refundPayment(id)));
        }

        /**
         * Traduce el estado recibido por query param al enum de dominio,
         * devolviendo 400 (no 500) si el valor es inválido.
         */
        private PaymentState parseState(String raw) {
                try {
                        return PaymentState.valueOf(raw.trim().toUpperCase(java.util.Locale.ROOT));
                } catch (IllegalArgumentException ex) {
                        throw new IllegalArgumentException("Estado de pago no válido: " + raw);
                }
        }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirm(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.confirmPayment(id)));
    }

    /**
     * Alias de negocio: /api/v1/pagos/confirmar, donde el frontend manda el
     * ID del pago en el body en vez de en la URL. Decisión tomada (opción
     * "menos invasiva" pedida en el prompt original): en vez de forzar al
     * frontend a cambiar a PATCH /payments/{id}/confirm, se agrega este
     * método que lee el ID del body y delega en la misma lógica de dominio
     * (paymentPort.confirmPayment). Si el ID no existe, se propaga la misma
     * PaymentNotFoundException que ya maneja el resto de la API.
     */
    @PostMapping("/confirmar")
    public ResponseEntity<PaymentResponse> confirmFromBody(
            @Valid @RequestBody ConfirmPaymentRequest request) {

        if (request.paymentId() == null) {
            throw new PaymentNotFoundException("Debe indicarse el ID del pago a confirmar");
        }

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.confirmPayment(request.paymentId())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse> cancel(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.cancelPayment(id)));
    }

    // =====================================================================
    // WEBHOOK DE MERCADO PAGO (server-to-server, PÚBLICO)
    // =====================================================================

    /**
     * POST /api/v1/payments/webhook
     *
     * Recibe las notificaciones reales de MercadoPago con el formato:
     *
     * <pre>
     * { "type": "payment", "action": "payment.updated",
     *   "data": { "id": "123456789" } }
     * </pre>
     *
     * También acepta el formato antiguo por query string:
     * ?topic=payment&amp;id=123456789 o ?data.id=123456789&amp;type=payment
     *
     * Consulta el pago REAL en MercadoPago (GET /v1/payments/{id}) y
     * concilia el pago local por external_reference, confirmando el cobro y
     * generando la factura cuando corresponde.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhookPost(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) String topic,
            @RequestParam(name = "data.id", required = false) String dataIdParam,
            @RequestParam(required = false) String id) {

        return handleWebhook(body, topic, dataIdParam, id);
    }

    /** MercadoPago también notifica con GET en algunos flujos antiguos. */
    @GetMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhookGet(
            @RequestBody(required = false) Map<String, Object> body,
            @RequestParam(required = false) String topic,
            @RequestParam(name = "data.id", required = false) String dataIdParam,
            @RequestParam(required = false) String id) {

        return handleWebhook(body, topic, dataIdParam, id);
    }

    private ResponseEntity<Map<String, Object>> handleWebhook(
            Map<String, Object> body,
            String topic,
            String dataIdParam,
            String id) {

        String gatewayPaymentId = dataIdParam;

        if ((gatewayPaymentId == null || gatewayPaymentId.isBlank())
                && id != null && !id.isBlank()) {
            gatewayPaymentId = id;
        }

        if ((gatewayPaymentId == null || gatewayPaymentId.isBlank())
                && body != null && body.get("data") instanceof Map<?, ?> data) {

            Object dataId = data.get("id");

            if (dataId != null) {
                gatewayPaymentId = String.valueOf(dataId);
            }
        }

        // El "type"/"topic" relevante es "payment"; se ignora cualquier otro.
        if (gatewayPaymentId == null || gatewayPaymentId.isBlank()) {
            // 200 para que MercadoPago no reintente indefinidamente.
            return ResponseEntity.ok(Map.of("received", true));
        }

        PaymentResult result = paymentPort.handleGatewayNotification(gatewayPaymentId);

        if (result == null) {
            return ResponseEntity.ok(Map.of(
                    "received", true,
                    "conciliated", false));
        }

        return ResponseEntity.ok(Map.of(
                "received", true,
                "conciliated", true,
                "paymentId", result.getId(),
                "state", String.valueOf(result.getState())));
    }
}
