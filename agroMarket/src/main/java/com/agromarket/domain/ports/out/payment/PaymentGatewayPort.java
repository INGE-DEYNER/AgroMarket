package com.agromarket.domain.ports.out.payment;

import com.agromarket.domain.models.payment.CardPaymentDetails;
import com.agromarket.domain.models.payment.GatewayPaymentInfo;
import com.agromarket.domain.models.payment.Payment;
import com.agromarket.domain.models.payment.PaymentInitiationResult;

/**
 * Puerto de salida para la integración con una pasarela externa de pagos.
 *
 * <p>
 * No representa persistencia. La implementación concreta puede
 * conectarse con Wompi, ePayco, Stripe u otra pasarela.
 * </p>
 */
public interface PaymentGatewayPort {

    /**
     * Inicia una transacción en la pasarela de pago.
     *
     * @param payment pago que se desea iniciar
     * @return información necesaria para continuar el checkout
     */
    PaymentInitiationResult initiate(Payment payment);

    /**
     * Verifica una transacción en la pasarela.
     *
     * <p>
     * La referencia puede ser un ID de pago de la pasarela (numérico,
     * como los que entrega MercadoPago en el callback/webhook) o la
     * referencia guardada al iniciar el pago (ID de preferencia).
     * </p>
     *
     * @param gatewayReference referencia entregada por la pasarela
     * @return true si la transacción es válida/confirmada
     */
    boolean verifyTransaction(String gatewayReference);

    /**
     * Obtiene el monto de la transacción reportado por la pasarela de pago.
     *
     * @param gatewayReference referencia entregada por la pasarela
     * @return monto de la transacción, o BigDecimal.ZERO si no se pudo determinar
     */
    java.math.BigDecimal getTransactionAmount(String gatewayReference);

    /**
     * Consulta un pago en la pasarela por su ID (por ejemplo el
     * "payment_id" que MercadoPago entrega en el callback o webhook).
     *
     * @param gatewayPaymentId ID del pago en la pasarela
     * @return información del pago, o null si no se pudo consultar
     */
    GatewayPaymentInfo fetchGatewayPayment(String gatewayPaymentId);

    /**
     * Crea un pago con tarjeta en la pasarela usando el token generado
     * por el Card Payment Brick (el pago real se crea del lado servidor).
     *
     * @param payment pago local al que se asociará el cobro
     * @param details datos de la tarjeta tokenizada
     * @return información del pago creado en la pasarela, o null si falló
     */
    GatewayPaymentInfo createCardPayment(Payment payment, CardPaymentDetails details);

    /**
     * Busca en la pasarela pagos asociados a una referencia externa
     * (external_reference = "AGROMARKET-{id}").
     *
     * @param externalReference referencia externa completa
     * @return el pago más reciente encontrado, o null si no hay ninguno
     */
    GatewayPaymentInfo findLatestByExternalReference(String externalReference);

    boolean refundTransaction(String gatewayPaymentId);
}