package com.agromarket.domain.models.payment;

/**
 * Datos requeridos por la pasarela para crear un pago con tarjeta
 * a partir del token generado por el Card Payment Brick del frontend.
 *
 * <p>
 * El token es un token de carta (one-time) generado por el SDK de
 * MercadoPago en el navegador; la tarjeta nunca toca nuestro backend.
 * </p>
 *
 * @author AgroMarket Team
 */
public class CardPaymentDetails {

    private final String token;
    private final String paymentMethodId;
    private final String issuerId;
    private final Integer installments;
    private final String payerEmail;

    public CardPaymentDetails(
            String token,
            String paymentMethodId,
            String issuerId,
            Integer installments,
            String payerEmail) {

        this.token = token;
        this.paymentMethodId = paymentMethodId;
        this.issuerId = issuerId;
        this.installments = installments;
        this.payerEmail = payerEmail;
    }

    public String getToken() {
        return token;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public String getIssuerId() {
        return issuerId;
    }

    public Integer getInstallments() {
        return installments == null || installments < 1 ? 1 : installments;
    }

    public String getPayerEmail() {
        return payerEmail;
    }
}