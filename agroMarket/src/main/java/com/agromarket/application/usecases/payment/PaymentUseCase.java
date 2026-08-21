// application/usecases/payment/PaymentUseCase.java
package com.agromarket.application.usecases.payment;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agromarket.domain.exceptions.order.OrderNotFoundException;
import com.agromarket.domain.exceptions.payment.InvalidPaymentStateException;
import com.agromarket.domain.exceptions.payment.PaymentNotFoundException;
import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;
import com.agromarket.domain.models.order.Order;
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

                if (order.getBuyer() == null
                                || order.getBuyer().getId() == null
                                || !order.getBuyer()
                                                .getId()
                                                .equals(buyerId)) {

                        throw new IllegalArgumentException(
                                        "El pedido no pertenece al comprador indicado");
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

                return initiation;
        }

        @Override
        @Transactional(readOnly = true)
        public PaymentResult getById(Long id) {

                Payment payment = findPayment(id);

                return toResult(payment);
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

                if (!paymentGatewayPort
                                .verifyTransaction(reference)) {

                        throw new InvalidPaymentStateException(
                                        "La transacción no pudo ser verificada");
                }

                payment.confirm(reference);

                Payment confirmed = paymentPort.save(payment);

                Order order = confirmed.getOrder();

                if (order == null
                                || order.getTotal() == null) {

                        throw new IllegalStateException(
                                        "El pago no tiene un pedido válido");
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

                return toResult(
                                confirmed,
                                toInvoiceResult(savedInvoice));
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