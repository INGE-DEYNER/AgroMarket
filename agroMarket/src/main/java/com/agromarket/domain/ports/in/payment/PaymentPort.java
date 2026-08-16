// domain/ports/in/payment/PaymentPort.java
package com.agromarket.domain.ports.in.payment;

import java.util.List;

import com.agromarket.domain.models.enums.payment.PaymentMethod;
import com.agromarket.domain.models.payment.PaymentInitiationResult;

public interface PaymentPort {

    PaymentInitiationResult initiatePayment(
            Long orderId,
            Long buyerId,
            PaymentMethod method);

    PaymentResult getById(Long id);

    List<PaymentResult> getByOrderId(Long orderId);

    PaymentResult confirmPayment(Long paymentId);

    PaymentResult cancelPayment(Long paymentId);
}