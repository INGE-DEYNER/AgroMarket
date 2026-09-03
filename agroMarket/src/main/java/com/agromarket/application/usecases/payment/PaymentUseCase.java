// application/usecases/payment/PaymentUseCase.java
package com.agromarket.application.usecases.payment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.exceptions.payment.InvalidPaymentStateException;
import com.agromarket.domain.exceptions.payment.PaymentNotFoundException;
import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.CardPaymentDetails;
import com.agromarket.domain.models.payment.GatewayPaymentInfo;
import com.agromarket.domain.models.payment.Invoice;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;
import com.agromarket.domain.ports.in.payment.InvoiceResult;
import com.agromarket.domain.ports.in.payment.PaymentPort;
import com.agromarket.domain.ports.in.payment.PaymentResult;
import com.agromarket.domain.ports.out.order.OrderPort;
import com.agromarket.domain.ports.out.payment.InvoicePort;
import com.agromarket.domain.ports.out.payment.PaymentGatewayPort;
import com.agromarket.domain.services.payment.InvoiceService;
import com.agromarket.domain.services.payment.PaymentService;

@Service
public class PaymentUseCase implements PaymentPort {

        private static final Logger logger = LoggerFactory.getLogger(PaymentUseCase.class);

        private final com.agromarket.domain.ports.out.payment.PaymentPort paymentPort;
        private final InvoicePort invoicePort;
        private final PaymentGatewayPort paymentGatewayPort;
        private final OrderPort orderPort;
        private final PaymentService paymentService;
        private final InvoiceService invoiceService;

        public PaymentUseCase(
                        com.agromarket.domain.ports.out.payment.PaymentPort paymentPort,
                        InvoicePort invoicePort,
                        PaymentGatewayPort paymentGatewayPort,
                        OrderPort orderPort,
                        PaymentService paymentService,
                        InvoiceService invoiceService) {

                this.paymentPort = paymentPort;
                this.invoicePort = invoicePort;
                this.paymentGatewayPort = paymentGatewayPort;
                this.orderPort = orderPort;
                this.paymentService = paymentService;
                this.invoiceService = invoiceService;
        }

        @Override
        @Transactional
        public PaymentInitiationResult initiatePayment(
                        Long orderId,
                        Long buyerId,
                        PaymentMethod method) {

                Order order = orderPort.findById(orderId)
                                .orElseThrow(() -> new OrderNotFoundException(
                                                "Pedido no encontrado: " + orderId));

                Long effectiveBuyerId = buyerId;
                if (effectiveBuyerId == null && order.getBuyer() != null) {
                    effectiveBuyerId = order.getBuyer().getId();
                }

                if (order.getBuyer() != null && order.getBuyer().getId() != null && effectiveBuyerId != null) {
                    if (!order.getBuyer().getId().equals(effectiveBuyerId)) {
                        // Si difieren por ser mock / piloto o no coincidir exactamente, asociamos el comprador del pedido
                        effectiveBuyerId = order.getBuyer().getId();
                    }
                }

                BigDecimal amount = order.getTotal();

                if (amount == null
                                || amount.compareTo(BigDecimal.ZERO) <= 0) {

                        throw new IllegalArgumentException(
                                        "El pedido debe tener un total válido");
                }

                Payment payment = Payment.builder()
                                .order(order)
                                .amount(amount)
                                .paymentMethod(method)
                                .state(PaymentState.PENDING)
                                .build();

                /*
                 * Se guarda el pago ANTES de llamar a la pasarela para que el
                 * pago tenga ID: la external_reference de la preferencia de
                 * MercadoPago es "AGROMARKET-{paymentId}" y es la llave que
                 * usan el callback y el webhook para conciliar el cobro.
                 */
                payment = paymentPort.save(payment);

                PaymentInitiationResult initiation = paymentGatewayPort.initiate(payment);

                if (initiation == null
                                || initiation.getReference() == null
                                || initiation.getReference().isBlank()) {

                        throw new IllegalStateException(
                                        "La pasarela no devolvió una referencia válida");
                }

                payment.setGatewayReference(
                                initiation.getReference());

                paymentPort.save(payment);

                return new PaymentInitiationResult(
                                initiation.getCheckoutUrl(),
                                initiation.getReference(),
                                payment.getId());
        }

        @Override
        @Transactional(readOnly = true)
        public PaymentResult getById(Long id) {

                Payment payment = findPayment(id);

                return toResult(payment);
        }

        @Override
        @Transactional(readOnly = true)
        public Optional<PaymentResult> getByGatewayReference(String gatewayReference) {

                if (gatewayReference == null
                                || gatewayReference.isBlank()) {

                        throw new IllegalArgumentException(
                                        "La referencia de pasarela no puede estar vacía");
                }

                return paymentPort
                                .findByGatewayReference(gatewayReference)
                                .map(this::toResult);
        }

        @Override
        @Transactional(readOnly = true)
        public List<PaymentResult> getByOrderId(
                        Long orderId) {

                return paymentPort
                                .findByOrderId(orderId)
                                .stream()
                                .map(this::toResult)
                                .toList();
        }

        @Override
        @Transactional
        public PaymentResult confirmPayment(
                        Long paymentId) {

                Payment payment = findPayment(paymentId);

                paymentService.validateConfirmation(payment);

                String reference = payment.getGatewayReference();

                if (reference == null
                                || reference.isBlank()) {

                        throw new InvalidPaymentStateException(
                                        "El pago no tiene referencia de pasarela");
                }

                /*
                 * Verificación REAL en MercadoPago:
                 * - referencia numérica -> es un payment_id -> GET /v1/payments/{id}
                 * - referencia de preferencia -> se busca el pago de MercadoPago
                 *   por external_reference = "AGROMARKET-{paymentId}"
                 */
                GatewayPaymentInfo info = isNumeric(reference)
                                ? paymentGatewayPort.fetchGatewayPayment(reference)
                                : paymentGatewayPort.findLatestByExternalReference(
                                                gatewayExternalReference(paymentId));

                if (info == null) {
                        throw new InvalidPaymentStateException(
                                        "La transacción no pudo ser verificada en la pasarela");
                }

                return applyGatewayResult(payment, info);
        }

        @Override
        @Transactional
        public PaymentResult confirmFromGateway(
                        Long paymentId,
                        String gatewayPaymentId) {

                if (gatewayPaymentId == null || gatewayPaymentId.isBlank()) {
                        throw new InvalidPaymentStateException(
                                        "Falta el ID de pago de la pasarela");
                }

                Payment payment = findPayment(paymentId);

                if (payment.getState() == PaymentState.CONFIRMED) {
                        return toResult(payment);
                }

                GatewayPaymentInfo info = paymentGatewayPort.fetchGatewayPayment(gatewayPaymentId);

                if (info == null) {
                        throw new InvalidPaymentStateException(
                                        "La transacción no pudo ser verificada en la pasarela");
                }

                /*
                 * Seguridad: el pago de MercadoPago debe corresponder a este
                 * pago local (external_reference = "AGROMARKET-{id}").
                 */
                String expectedReference = gatewayExternalReference(paymentId);
                if (info.getExternalReference() != null
                                && !expectedReference.equals(info.getExternalReference())) {

                        throw new InvalidPaymentStateException(
                                        "La transacción de la pasarela no corresponde al pago indicado");
                }

                return applyGatewayResult(payment, info);
        }

        @Override
        @Transactional
        public PaymentResult processCardPayment(
                        Long paymentId,
                        CardPaymentDetails details) {

                Payment payment = findPayment(paymentId);

                if (payment.getState() == PaymentState.CONFIRMED) {
                        return toResult(payment);
                }

                GatewayPaymentInfo info = paymentGatewayPort.createCardPayment(payment, details);

                if (info == null) {
                        throw new InvalidPaymentStateException(
                                        "La pasarela no devolvió información del pago");
                }

                // Vincular la referencia del pago de la pasarela en todos los casos
                if (info.getGatewayPaymentId() != null) {
                        payment.setGatewayReference(info.getGatewayPaymentId());
                        payment = paymentPort.save(payment);
                }

                return applyGatewayResult(payment, info);
        }

        @Override
        @Transactional
        public PaymentResult handleGatewayNotification(String gatewayPaymentId) {

                if (gatewayPaymentId == null || gatewayPaymentId.isBlank()) {
                        throw new IllegalArgumentException(
                                        "La notificación no incluye el ID del pago");
                }

                GatewayPaymentInfo info = paymentGatewayPort.fetchGatewayPayment(gatewayPaymentId);

                if (info == null) {
                        logger.warn("Webhook: no se pudo consultar el pago {} en la pasarela",
                                        gatewayPaymentId);
                        return null;
                }

                Long paymentId = parsePaymentIdFromExternalReference(info.getExternalReference());

                if (paymentId == null) {
                        logger.warn("Webhook: el pago {} no tiene external_reference conocida ({})",
                                        gatewayPaymentId, info.getExternalReference());
                        return null;
                }

                Payment payment = findPayment(paymentId);

                if (payment.getState() == PaymentState.CONFIRMED) {
                        return toResult(payment);
                }

                return applyGatewayResult(payment, info);
        }

        @Override
        @Transactional
        public PaymentResult cancelPayment(
                        Long paymentId) {

                Payment payment = findPayment(paymentId);

                if (!paymentService.canReject(payment)) {

                        throw new InvalidPaymentStateException(
                                        "El pago no puede cancelarse desde su estado actual");
                }

                payment.reject();

                return toResult(
                                paymentPort.save(payment));
        }

        /**
         * Aplica el estado REAL reportado por la pasarela al pago local:
         * aprobado -> confirmado + factura; rechazado -> rechazado;
         * pendiente -> se mantiene pendiente con la referencia actualizada.
         */
        private PaymentResult applyGatewayResult(Payment payment, GatewayPaymentInfo info) {

                if (info.isApproved()) {
                        payment.confirm(info.getGatewayPaymentId() != null
                                        ? info.getGatewayPaymentId()
                                        : payment.getGatewayReference());

                        Payment confirmed = paymentPort.save(payment);

                        Invoice invoice = createInvoiceFor(confirmed);

                        return toResult(confirmed, toInvoiceResult(invoice));
                }

                if (info.isRejected()) {
                        payment.reject();
                        Payment rejected = paymentPort.save(payment);
                        return toResult(rejected);
                }

                // Pendiente / en proceso: se guarda la referencia y queda PENDING
                if (info.getGatewayPaymentId() != null) {
                        payment.setGatewayReference(info.getGatewayPaymentId());
                        payment = paymentPort.save(payment);
                }

                return toResult(payment);
        }

        /**
         * Crea la factura asociada a un pago confirmado (idempotente: si el
         * pedido ya tiene factura, devuelve la existente).
         *
         * FIX: el pago se carga desde la persistencia con una referencia
         * LIGERA de la orden (solo el ID, ver PaymentEntity.toDomain()), por
         * lo que order.getTotal() y order.getBuyer() llegan en null y esto
         * lanzaba "El pago no tiene un pedido válido" ANTES de persistir la
         * factura -> las facturas nunca aparecían en "Mis Facturas".
         * Ahora se recarga la orden completa (total, buyer, product) desde
         * OrderPort antes de facturar.
         */
        private Invoice createInvoiceFor(Payment payment) {

                Order order = payment.getOrder();

                if (order == null || order.getId() == null) {
                        throw new IllegalStateException(
                                        "El pago no tiene un pedido válido");
                }

                /*
                 * La referencia ligera no trae total ni comprador: recargar
                 * la orden real para facturar con datos verdaderos y para
                 * que la factura quede asociada al userId del comprador
                 * (así sí aparece en GET /facturas/mis-facturas).
                 */
                if (order.getTotal() == null
                                || order.getBuyer() == null) {

                        Long orderId = order.getId();

                        order = orderPort.findById(orderId)
                                        .orElseThrow(() -> new IllegalStateException(
                                                        "El pedido del pago no existe: "
                                                                        + orderId));
                        payment.setOrder(order);
                }

                if (order.getTotal() == null) {
                        throw new IllegalStateException(
                                        "El pago no tiene un pedido válido");
                }

                var existing = invoicePort.findByOrderId(order.getId());

                if (existing.isPresent()) {
                        return existing.get();
                }

                BigDecimal subtotal = order.getTotal();

                BigDecimal tax = invoiceService.calculateTax(subtotal);

                BigDecimal total = invoiceService.calculateTotal(subtotal);

                Invoice invoice = Invoice.builder()
                                .order(order)
                                .subtotal(subtotal)
                                .tax(tax)
                                .total(total)
                                .build();

                invoice.generateInvoiceNumber();

                Invoice savedInvoice = invoicePort.save(invoice);

                /*
                 * Invoice.generateInvoiceNumber() uses the document ID.
                 * If persistence only assigned it after the first save, we regenerate
                 * the number with the final ID and update the invoice.
                 */
                if (savedInvoice.getId() != null) {
                        savedInvoice.generateInvoiceNumber();
                        savedInvoice = invoicePort.save(savedInvoice);
                }

                return savedInvoice;
        }

        /** external_reference usada en MercadoPago para este pago local. */
        private String gatewayExternalReference(Long paymentId) {
                return GatewayPaymentInfo.EXTERNAL_REFERENCE_PREFIX + paymentId;
        }

        /** Extrae el ID de pago local desde "AGROMARKET-{id}" (o null). */
        private Long parsePaymentIdFromExternalReference(String externalReference) {

                if (externalReference == null
                                || !externalReference.startsWith(
                                                GatewayPaymentInfo.EXTERNAL_REFERENCE_PREFIX)) {
                        return null;
                }

                try {
                        return Long.parseLong(
                                        externalReference.substring(
                                                        GatewayPaymentInfo.EXTERNAL_REFERENCE_PREFIX
                                                                        .length()));
                } catch (NumberFormatException e) {
                        return null;
                }
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

        private Payment findPayment(Long id) {

                return paymentPort.findById(id)
                                .orElseThrow(() -> new PaymentNotFoundException(
                                                "Pago no encontrado: " + id));
        }

        private PaymentResult toResult(
                        Payment payment) {

                if (payment == null) {
                        return null;
                }

                InvoiceResult invoiceResult = null;

                if (payment.getOrder() != null
                                && payment.getOrder().getId() != null) {

                        invoiceResult = invoicePort
                                        .findByOrderId(
                                                        payment.getOrder().getId())
                                        .map(this::toInvoiceResult)
                                        .orElse(null);
                }

                return toResult(
                                payment,
                                invoiceResult);
        }

        private PaymentResult toResult(
                        Payment payment,
                        InvoiceResult invoiceResult) {

                return PaymentResult.builder()
                                .id(payment.getId())
                                .orderId(
                                                payment.getOrder() != null
                                                                ? payment.getOrder().getId()
                                                                : null)
                                .amount(payment.getAmount())
                                .paymentMethod(
                                                payment.getPaymentMethod())
                                .state(payment.getState())
                                .gatewayReference(
                                                payment.getGatewayReference())
                                .paymentDate(
                                                payment.getPaymentDate())
                                .invoice(invoiceResult)
                                .build();
        }

        private InvoiceResult toInvoiceResult(
                        Invoice invoice) {

                if (invoice == null) {
                        return null;
                }

                return InvoiceResult.builder()
                                .id(invoice.getId())
                                .orderId(
                                                invoice.getOrder() != null
                                                                ? invoice.getOrder().getId()
                                                                : null)
                                .subtotal(invoice.getSubtotal())
                                .tax(invoice.getTax())
                                .total(invoice.getTotal())
                                .issueDate(invoice.getIssueDate())
                                .invoiceNumber(
                                                invoice.getInvoiceNumber())
                                .build();
        }
}