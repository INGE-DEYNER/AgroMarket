// application/adapters/api/response/payment/InvoiceResponse.java
package com.agromarket.application.adapters.api.response.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.ports.in.payment.InvoiceResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;

    private Long orderId;

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal total;

    private LocalDateTime issueDate;

    private String invoiceNumber;

    public static InvoiceResponse fromResult(
            InvoiceResult result) {

        if (result == null) {
            return null;
        }

        return InvoiceResponse.builder()
                .id(result.getId())
                .orderId(result.getOrderId())
                .subtotal(result.getSubtotal())
                .tax(result.getTax())
                .total(result.getTotal())
                .issueDate(result.getIssueDate())
                .invoiceNumber(
                        result.getInvoiceNumber())
                .build();
    }
}