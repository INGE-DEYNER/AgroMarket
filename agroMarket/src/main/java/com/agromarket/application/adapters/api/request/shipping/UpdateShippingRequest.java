package com.agromarket.application.adapters.api.request.shipping;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Datos de seguimiento que registra el productor sobre un envío.
 *
 * <p>Acepta los nombres en español que envía el frontend ({@code transportista},
 * {@code guia}, {@code fechaEstimadaEntrega}) y los del dominio ({@code carrier},
 * {@code trackingNumber}, {@code estimatedDeliveryDate}), de modo que un
 * desajuste de nombres no vuelva a fallar en silencio.</p>
 *
 * <p>El estado del envío <b>no</b> se modifica aquí: las transiciones válidas
 * las gobierna {@code PATCH /shipments/{id}/advance}.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShippingRequest {

    @JsonAlias({ "transportista", "carrier" })
    private String carrier;

    @JsonAlias({ "guia", "trackingNumber", "numeroGuia" })
    private String trackingNumber;

    @JsonAlias({ "fechaEstimadaEntrega", "estimatedDeliveryDate" })
    private LocalDate estimatedDeliveryDate;
}