
package com.agromarket.domain.ports.in.payment;

import java.util.List;

import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;

/**
 * Puerto de entrada para las operaciones de pago.
 */
public interface PaymentPort {

    /**
     * Inicia un pago asociado a un pedido.
     */
    PaymentInitiationResult initiatePayment(
            Long orderId,
            Long buyerId
    );

    /**
     * Obtiene un pago por ID.
     */
    Payment getById(Long id);

    /**
     * Obtiene los pagos asociados a un pedido.
     */
    List<Payment> getByOrderId(Long orderId);

    /**
     * Confirma un pago.
     */
    Payment confirmPayment(Long paymentId);

    /**
     * Cancela un pago pendiente.
     */
    Payment cancelPayment(Long paymentId);
}