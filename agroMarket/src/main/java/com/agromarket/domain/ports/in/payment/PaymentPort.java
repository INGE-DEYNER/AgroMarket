// domain/ports/in/payment/PaymentPort.java
package com.agromarket.domain.ports.in.payment;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.payment.CardPaymentDetails;
import com.agromarket.domain.models.payment.PaymentInitiationResult;

public interface PaymentPort {

    PaymentInitiationResult initiatePayment(
            Long orderId,
            Long buyerId,
            PaymentMethod method);

    PaymentResult getById(Long id);

    List<PaymentResult> getByOrderId(Long orderId);

    Optional<PaymentResult> getByGatewayReference(String gatewayReference);

    /**
     * Confirma un pago verificando la transacción en la pasarela.
     *
     * @param paymentId ID interno del pago
     * @return resultado del pago confirmado (con factura generada)
     */
    PaymentResult confirmPayment(Long paymentId);

    /**
     * Confirma (o rechaza/deja pendiente) un pago a partir del resultado
     * real consultado en la pasarela para un ID de pago de MercadoPago.
     *
     * @param paymentId        ID interno del pago
     * @param gatewayPaymentId ID del pago en la pasarela (payment_id)
     * @return resultado actualizado del pago
     */
    PaymentResult confirmFromGateway(Long paymentId, String gatewayPaymentId);

    /**
     * Crea el pago con tarjeta en la pasarela usando el token generado por
     * el Card Payment Brick y actualiza el estado del pago local según el
     * resultado real.
     *
     * @param paymentId ID interno del pago
     * @param details   datos de la tarjeta tokenizada
     * @return resultado actualizado del pago
     */
    PaymentResult processCardPayment(Long paymentId, CardPaymentDetails details);

    /**
     * Procesa una notificación (webhook) de la pasarela: consulta el pago
     * real en MercadoPago y actualiza el pago local correspondiente.
     *
     * @param gatewayPaymentId ID del pago en la pasarela
     * @return resultado actualizado del pago local, o null si no se pudo
     *         asociar a un pago local
     */
    PaymentResult handleGatewayNotification(String gatewayPaymentId);

    PaymentResult cancelPayment(Long paymentId);
    }
