package com.agromarket.domain.models.payment;

import java.math.BigDecimal;

/**
 * Clase que representa el resultado de la iniciación de un proceso de pago.
 * Contiene la URL de checkout y la referencia de la transacción.
 * 
 * @author AgroMarket Team
 */
public class PaymentInitiationResult {
    
    private final String checkoutUrl;
    private final String reference;
    private final Long paymentId;
    
    /**
     * Constructor que inicializa el resultado de la iniciación de pago.
     * 
     * @param checkoutUrl URL a la cual el usuario debe ser redirigido para completar el pago
     * @param reference referencia única de la transacción de pago
     */
    public PaymentInitiationResult(String checkoutUrl, String reference) {
        this(checkoutUrl, reference, null);
    }

    /**
     * Constructor completo que incluye el ID interno del pago creado.
     *
     * @param checkoutUrl URL a la cual el usuario debe ser redirigido para completar el pago
     * @param reference referencia única de la transacción de pago
     * @param paymentId ID interno (BD) del pago asociado
     */
    public PaymentInitiationResult(String checkoutUrl, String reference, Long paymentId) {
        this.checkoutUrl = checkoutUrl;
        this.reference = reference;
        this.paymentId = paymentId;
    }
    
    /**
     * Obtiene la URL de checkout.
     * 
     * @return URL de checkout
     */
    public String getCheckoutUrl() {
        return checkoutUrl;
    }
    
    /**
     * Obtiene la referencia de la transacción.
     * 
     * @return referencia de la transacción
     */
    public String getReference() {
        return reference;
    }

    /**
     * Obtiene el ID interno del pago (puede ser null si no se conoce).
     *
     * @return ID interno del pago o null
     */
    public Long getPaymentId() {
        return paymentId;
    }
}
