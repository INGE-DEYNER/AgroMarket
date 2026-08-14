package com.agromarket.domain.payment.enums;

/**
 * Enumeración que representa los posibles estados de un pago en el sistema.
 * Define el ciclo de vida de una transacción financiera.
 * 
 * @author AgroMarket Team
 */
public enum PaymentState {
    /**
     * El pago está pendiente de procesamiento o confirmación.
     */
    PENDING,
    
    /**
     * El pago ha sido confirmado y procesado exitosamente.
     */
    CONFIRMED,
    
    /**
     * El pago ha sido rechazado por la pasarela o el banco.
     */
    REJECTED,
    
    /**
     * El pago ha sido revertido (chargeback o devolución iniciada).
     */
    REVERSED,
    
    /**
     * El pago está en fideicomiso (retenido hasta la entrega).
     */
    IN_ESCROW,
    
    /**
     * El pago ha sido liberado al vendedor.
     */
    RELEASED,
    
    /**
     * El pago ha sido reembolsado al comprador.
     */
    REFUNDED,
    
    /**
     * El pago está en proceso de verificación o validación.
     */
    IN_PROCESS
}
