package com.agromarket.domain.models.payment;

public class PaymentInitiationResult {
    private final String checkoutUrl;
    private final String reference;

    public PaymentInitiationResult(String checkoutUrl, String reference) {
        this.checkoutUrl = checkoutUrl;
        this.reference = reference;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public String getReference() {
        return reference;
    }
}