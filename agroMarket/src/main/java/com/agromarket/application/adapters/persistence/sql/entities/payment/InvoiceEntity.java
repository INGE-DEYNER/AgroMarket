package com.agromarket.application.adapters.persistence.sql.entities.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.agromarket.application.adapters.persistence.sql.entities.order.OrderEntity;
import com.agromarket.domain.models.order.Order;
import com.agromarket.domain.models.payment.Invoice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "order_id", nullable = false)
        private OrderEntity order;

        private BigDecimal subtotal;

        private BigDecimal tax;

        private BigDecimal total;

        private LocalDateTime issueDate;

        private String invoiceNumber;

        public Invoice toDomain() {
                return Invoice.builder()
                                .id(id)
                                .order(order == null
                                                ? null
                                                : Order.builder().id(order.getId()).build())
                                .subtotal(subtotal)
                                .tax(tax)
                                .total(total)
                                .issueDate(issueDate)
                                .invoiceNumber(invoiceNumber)
                                .build();
        }

        public static InvoiceEntity fromDomain(
                        Invoice invoice,
                        OrderEntity order) {

                return InvoiceEntity.builder()
                                .id(invoice.getId())
                                .order(order)
                                .subtotal(invoice.getSubtotal())
                                .tax(invoice.getTax())
                                .total(invoice.getTotal())
                                .issueDate(invoice.getIssueDate())
                                .invoiceNumber(invoice.getInvoiceNumber())
                                .build();
        }
}
