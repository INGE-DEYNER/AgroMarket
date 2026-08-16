// application/adapters/api/controllers/payment/PaymentController.java
package com.agromarket.application.adapters.api.controllers.payment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agromarket.application.adapters.api.request.payment.InitiatePaymentRequest;
import com.agromarket.application.adapters.api.response.payment.PaymentInitiationResponse;
import com.agromarket.application.adapters.api.response.payment.PaymentResponse;
import com.agromarket.domain.ports.in.payment.PaymentPort;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentPort paymentPort;

    @PostMapping
    public ResponseEntity<PaymentInitiationResponse> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        PaymentInitiationResponse
                                .fromDomainResult(
                                        paymentPort.initiatePayment(
                                                request.getOrderId(),
                                                request.getBuyerId(),
                                                request.getPaymentMethod())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.getById(id)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentPort
                        .getByOrderId(orderId)
                        .stream()
                        .map(PaymentResponse::fromResult)
                        .toList());
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PaymentResponse> confirm(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.confirmPayment(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PaymentResponse> cancel(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                PaymentResponse.fromResult(
                        paymentPort.cancelPayment(id)));
    }
}