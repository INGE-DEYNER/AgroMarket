package com.agromarket.domain.models.payment;

import java.math.BigDecimal;

/**
 * Información de un pago reportada por la pasarela de pagos (MercadoPago).
 *
 * <p>
 * Es el resultado de consultar un pago en la pasarela (por ejemplo
 * GET /v1/payments/{id} en MercadoPago) y contiene lo mínimo necesario
 * para verificar y conciliar un pago local.
 * </p>
 *
 * @author AgroMarket Team
 */
public class GatewayPaymentInfo {

    /**
     * Prefijo de la external_reference que vincula pagos locales con
     * MercadoPago: "AGROMARKET-{paymentId}".
     */
    public static final String EXTERNAL_REFERENCE_PREFIX = "AGROMARKET-";

    private final String gatewayPaymentId;
    private final String status;
    private final String statusDetail;
    private final String externalReference;
    private final BigDecimal amount;

    public GatewayPaymentInfo(
            String gatewayPaymentId,
            String status,
            String statusDetail,
            String externalReference,
            BigDecimal amount) {

        this.gatewayPaymentId = gatewayPaymentId;
        this.status = status;
        this.statusDetail = statusDetail;
        this.externalReference = externalReference;
        this.amount = amount;
    }

    public String getGatewayPaymentId() {
        return gatewayPaymentId;
    }

    /**
     * Estado crudo reportado por la pasarela
     * (approved, pending, in_process, rejected, cancelled...).
     */
    public String getStatus() {
        return status;
    }

    public String getStatusDetail() {
        return statusDetail;
    }

    /**
     * Referencia externa enviada al crear el pago
     * ("AGROMARKET-{id}"). Puede ser null.
     */
    public String getExternalReference() {
        return externalReference;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * @return true si el pago quedó aprobado/autorizado en la pasarela.
     */
    public boolean isApproved() {
        return "approved".equalsIgnoreCase(status)
                || "authorized".equalsIgnoreCase(status);
    }

    /**
     * @return true si el pago fue rechazado o cancelado en la pasarela.
     */
    public boolean isRejected() {
        return "rejected".equalsIgnoreCase(status)
                || "cancelled".equalsIgnoreCase(status);
    }

    /**
     * @return true si el pago quedó pendiente (en proceso) en la pasarela.
     */
    public boolean isPending() {
        return "pending".equalsIgnoreCase(status)
                || "in_process".equalsIgnoreCase(status)
                || "in_mediation".equalsIgnoreCase(status);
    }
}