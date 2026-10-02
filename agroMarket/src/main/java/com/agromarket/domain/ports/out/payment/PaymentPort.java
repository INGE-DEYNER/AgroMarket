package com.agromarket.domain.ports.out.payment;

import java.util.List;
import java.util.Optional;

import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.enums.payment.PaymentState;

/**
 * Puerto de salida para la persistencia de pagos.
 */
public interface PaymentPort {

    /**
     * Guarda un pago.
     *
     * @param payment pago a guardar
     * @return pago guardado
     */
    Payment save(Payment payment);

    /**
     * Busca un pago por su identificador.
     *
     * @param id identificador del pago
     * @return pago si existe
     */
    Optional<Payment> findById(Long id);

    /**
     * Busca todos los pagos asociados a un pedido.
     *
     * @param orderId identificador del pedido
     * @return lista de pagos del pedido
     */
    List<Payment> findByOrderId(Long orderId);

    /**
     * Verifica si existe un pago con el identificador indicado.
     *
     * @param id identificador del pago
     * @return true si existe
     */
    boolean existsById(Long id);

    /**
     * Busca un pago por su referencia de pasarela (gatewayReference).
     * Usado por GET /api/v1/payments?gatewayReference=... .
     *
     * @param gatewayReference referencia devuelta por la pasarela de pago
     * @return pago si existe
     */
    Optional<Payment> findByGatewayReference(String gatewayReference);

    List<Payment> findByState(PaymentState state);
}