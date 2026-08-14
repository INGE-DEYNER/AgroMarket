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
 * Entidad de dominio que representa una factura en el sistema AgroMarket.
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
     * Pedido asociado a esta factura.
     */
    private Order order;
    
    /**
     * Subtotal de la factura (antes de impuestos).
     */
    private BigDecimal subtotal;
    
    /**
     * Monto del impuesto aplicado.
     */
    private BigDecimal tax;
    
    /**
     * Total de la factura (subtotal + impuesto).
     */
    private BigDecimal total;
    
    /**
     * Fecha y hora en que se emitió la factura.
     */
    private LocalDateTime issueDate;
    
    /**
     * Número de factura (identificador único).
     */
    private String invoiceNumber;
    
    
    // ==================== MÉTODOS DE NEGOCIO ====================
    
    /**
     * Genera un número de factura único basado en el ID y el año actual.
     * 
     * @return número de factura generado
     */
    public String generateInvoiceNumber() {
        Long invoiceId = id == null ? 0L : id;
        int year = LocalDateTime.now().getYear();
        this.invoiceNumber = "INV-" + invoiceId + "-" + year;
        return invoiceNumber;
    }
    
    /**
     * Calcula los valores de la factura (impuesto y total) basado en el subtotal.
     * El impuesto se calcula como 19% del subtotal (IVA colombiano).
     * 
     * @param subtotal subtotal de la factura
     */
    public void calculateValues(BigDecimal subtotal) {
        this.subtotal = subtotal;
        this.tax = subtotal.multiply(BigDecimal.valueOf(0.19)).setScale(2, RoundingMode.HALF_UP);
        this.total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);
    }
}
