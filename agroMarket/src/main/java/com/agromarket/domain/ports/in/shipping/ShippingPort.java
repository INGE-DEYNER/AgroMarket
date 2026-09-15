// domain/ports/in/shipping/ShippingPort.java
package com.agromarket.domain.ports.in.shipping;

import java.util.List;

public interface ShippingPort {

    ShippingResult createShipping(Long orderId);

    ShippingResult getById(Long id);

    ShippingResult getByOrderId(Long orderId);

    ShippingResult advanceState(Long shippingId);

    ShippingResult cancel(Long shippingId);

    List<ShippingResult> getAll();
}