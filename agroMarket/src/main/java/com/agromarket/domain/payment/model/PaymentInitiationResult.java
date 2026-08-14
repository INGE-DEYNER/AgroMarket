package com.agromarket.domain.payment.model;

/**
 * Clase que representa el resultado de la iniciación de un proceso de pago.
 * Contiene la URL de checkout y la referencia de la transacción.
 * 
 * @author AgroMarket Team
 */
public class PaymentInitiationResult {
    
    private final String checkoutUrl;
    private final String reference;
    
    /**
     * Constructor que inicializa el resultado de la iniciación de pago.
     * 
     * @param checkoutUrl URL a la cual el usuario debe ser redirigido para completar el pago
     * @param reference referencia única de la transacción de pago
     */
    public PaymentInitiationResult(String checkoutUrl, String reference) {
        this.checkoutUrl = checkoutUrl;
        this.reference = reference;
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
}
