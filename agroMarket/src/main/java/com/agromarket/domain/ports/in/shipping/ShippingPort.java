// domain/ports/in/shipping/ShippingPort.java
package com.agromarket.domain.ports.in.shipping;

import java.time.LocalDate;
import java.util.List;

public interface ShippingPort {

    ShippingResult createShipping(Long orderId);

    ShippingResult getById(Long id);

    ShippingResult getByOrderId(Long orderId);

    ShippingResult advanceState(Long shippingId);

    ShippingResult cancel(Long shippingId);

    /**
     * Actualiza los datos de seguimiento que registra el productor: transportista,
     * número de guía y fecha estimada de entrega.
     *
     * <p>Los campos nulos se conservan: el formulario del panel de productor
     * reenvía el objeto completo, pero así también admite actualizaciones
     * parciales. El estado NO se cambia aquí, para eso está
     * {@link #advanceState(Long)} que respeta las transiciones válidas.</p>
     */
    ShippingResult updateTracking(
            Long shippingId,
            String carrier,
            String trackingNumber,
            LocalDate estimatedDeliveryDate);

    List<ShippingResult> getAll();
}