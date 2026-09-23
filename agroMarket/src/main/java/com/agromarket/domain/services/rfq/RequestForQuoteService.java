package com.agromarket.domain.services.rfq;

import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.rfq.RequestForQuoteStatus;
import com.agromarket.domain.models.rfq.RequestForQuote;

/**
 * Servicio de dominio para las reglas de solicitudes de cotización.
 */
public class RequestForQuoteService {

    /**
     * Verifica si una solicitud todavía puede recibir ofertas.
     *
     * @param request solicitud
     * @return true si está activa y dentro del plazo
     */
    public boolean canReceiveOffers(
            RequestForQuote request) {

        if (request == null || !request.isActive()) {
            return false;
        }

        return request.getDeadline() == null
                || request.getDeadline()
                        .isAfter(LocalDateTime.now());
    }

    /**
     * Verifica si una solicitud tiene datos mínimos válidos.
     */
    public boolean isValid(
            RequestForQuote request) {

        return request != null
                && request.getBuyer() != null
                && request.getFruitType() != null
                && request.getRequiredQuantity() != null
                && request.getRequiredQuantity() > 0;
    }

    /**
     * Cierra una solicitud de cotización.
     *
     * @param request solicitud a cerrar
     * @throws IllegalArgumentException si la solicitud es null
     */
    public void close(
            RequestForQuote request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "La solicitud de cotización no puede ser null");
        }

        request.setStatus(
                RequestForQuoteStatus.CLOSED);
    }
}