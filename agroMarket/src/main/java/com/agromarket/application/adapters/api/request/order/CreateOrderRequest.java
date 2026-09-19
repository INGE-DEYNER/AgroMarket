package com.agromarket.application.adapters.api.request.order;

import java.math.BigDecimal;

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
public class CreateOrderRequest {

    private Long productId;
    private Long productoId;

    private Integer quantity;
    private Integer cantidad;

    private Long buyerId;
    private Long compradorId;

    private String shippingAddress;
    private String direccionEnvio;
    private String direccionCompleta;

    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private String checkoutId;
    private String checkout;

    /**
     * Valor de envío que el cliente declara (COP). El backend lo IGNORA si no
     * coincide con el costo configurado: la fuente de verdad del total es el
     * servidor, que cobra el envío una única vez por checkout.
     */
    private BigDecimal shippingCost;
    private BigDecimal envio;

    public Long getProductId() {
        if (productId != null) return productId;
        return productoId;
    }

    public Integer getQuantity() {
        if (quantity != null) return quantity;
        return cantidad != null ? cantidad : 1;
    }

    public Long getBuyerId() {
        if (buyerId != null) return buyerId;
        return compradorId;
    }

    public String getShippingAddress() {
        if (shippingAddress != null && !shippingAddress.isBlank()) return shippingAddress;
        if (direccionEnvio != null && !direccionEnvio.isBlank()) return direccionEnvio;
        if (direccionCompleta != null && !direccionCompleta.isBlank()) return direccionCompleta;
        return "Dirección de entrega";
    }

    public String getCheckoutId() {
        if (checkoutId != null && !checkoutId.isBlank()) return checkoutId;
        if (checkout != null && !checkout.isBlank()) return checkout;
        return null;
    }
}
