package com.agromarket.application.adapters.persistence.mongodb.documents.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invoices")
public class InvoiceDocument {

    @Id
    private String id;

    @Indexed
    private Long orderId;

    /**
     * Denormalized buyer id, kept in sync with order.getBuyer().getId() so
     * invoices can be queried by user without an extra lookup.
     */
    @Indexed
    private Long userId;

    private BigDecimal subtotal;

    private BigDecimal tax;

    private BigDecimal total;

    private LocalDateTime issueDate;

    private String invoiceNumber;

    public Invoice toDomain() {
        return Invoice.builder()
                .id(parseId(id))
                .order(orderReference(orderId))
                .subtotal(subtotal)
                .tax(tax)
                .total(total)
                .issueDate(issueDate)
                .invoiceNumber(invoiceNumber)
                .build();
    }

    public static InvoiceDocument fromDomain(Invoice invoice) {
        Long orderId = invoice.getOrder() != null
                ? invoice.getOrder().getId()
                : null;

        Long userId = invoice.getOrder() != null && invoice.getOrder().getBuyer() != null
                ? invoice.getOrder().getBuyer().getId()
                : null;

        return InvoiceDocument.builder()
                .id(invoice.getId() != null
                        ? invoice.getId().toString()
                        : null)
                .orderId(orderId)
                .userId(userId)
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .issueDate(invoice.getIssueDate())
                .invoiceNumber(invoice.getInvoiceNumber())
                .build();
    }

    private static Order orderReference(Long orderId) {
        return orderId == null
                ? null
                : Order.builder().id(orderId).build();
    }

    private static Long parseId(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}