// application/adapters/api/request/payment/CreatePreferenceRequest.java
package com.agromarket.application.adapters.api.request.payment;

import java.math.BigDecimal;

import com.agromarket.domain.models.enums.payment.PaymentMethod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO para la solicitud de creacin de una preferencia de pago en MercadoPago.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePreferenceRequest {

    /**
     * Referencia externa para identificar el pago en el sistema.
     */
    @NotBlank(message = "La referencia externa es obligatoria")
    private String externalReference;

    /**
     * Monto del pago.
     */
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser positivo")
    private BigDecimal amount;

    /**
     * Descripcin del pago.
     */
    @NotBlank(message = "La descripcin es obligatoria")
    private String description;

    /**
     * Email del pagador (opcional).
     */
    private String payerEmail;

    /**
     * Nombre del pagador (opcional).
     */
    private String payerName;

    /**
     * Identificacin del pagador (opcional, requerido para PSE).
     */
    private String payerIdentification;

    /**
     * Mtodo de pago preferido.
     */
    private PaymentMethod paymentMethod;

    /**
     * URL de xito.
     */
    @NotBlank(message = "La URL de xito es obligatoria")
    private String successUrl;

    /**
     * URL de fracaso.
     */
    @NotBlank(message = "La URL de fracaso es obligatoria")
    private String failureUrl;

    /**
     * URL de pendiente.
     */
    @NotBlank(message = "La URL de pendiente es obligatoria")
    private String pendingUrl;
}
