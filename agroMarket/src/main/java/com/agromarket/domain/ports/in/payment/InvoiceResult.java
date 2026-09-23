// domain/ports/in/payment/InvoiceResult.java
package com.agromarket.domain.ports.in.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResult {

    private Long id;

    private Long orderId;

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal total;

    private LocalDateTime issueDate;

    private String invoiceNumber;
}