
package com.agromarket.domain.ports.in.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.enums.payment.PaymentState;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {

    private Long id;

    private Long orderId;

    private BigDecimal amount;

    private PaymentMethod paymentMethod;

    private PaymentState state;

    private String gatewayReference;

    private LocalDateTime paymentDate;

    private InvoiceResult invoice;
}