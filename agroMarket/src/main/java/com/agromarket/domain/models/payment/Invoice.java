package com.agromarket.domain.models.payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import com.agromarket.domain.models.order.Order;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Domain entity that represents an invoice in the AgroMarket system.
 * Contiene información detallada sobre los cargos y impuestos de un pedido.
 * 
 * @author AgroMarket Team
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    
    private Long id;
    
    /**
     * Order associated with this invoice.
     */
    private Order order;
    
    /**
     * Invoice subtotal (before tax).
     */
    private BigDecimal subtotal;
    
    /**
     * Monto del impuesto aplicado.
     */
    private BigDecimal tax;
    
    /**
     * Invoice total (subtotal + tax).
     */
    private BigDecimal total;
    
    /**
     * Date and time the invoice was issued.
     */
    private LocalDateTime issueDate;
    
    /**
     * Invoice number (unique identifier).
     */
    private String invoiceNumber;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Generates a unique invoice number based on the ID and current year.
     * 
     * @return the generated invoice number
     */
    public String generateInvoiceNumber() {
        Long invoiceId = id == null ? 0L : id;
        int year = LocalDateTime.now().getYear();
        this.invoiceNumber = "INV-" + invoiceId + "-" + year;
        return invoiceNumber;
    }
    
    /**
     * Calculates the invoice values (tax and total) based on the subtotal.
     * El impuesto se calcula como 19% del subtotal (IVA colombiano).
     * 
     * @param subtotal invoice subtotal
     */
    public void calculateValues(BigDecimal subtotal) {
        this.subtotal = subtotal;
        this.tax = subtotal.multiply(BigDecimal.valueOf(0.19)).setScale(2, RoundingMode.HALF_UP);
        this.total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);
    }
}
