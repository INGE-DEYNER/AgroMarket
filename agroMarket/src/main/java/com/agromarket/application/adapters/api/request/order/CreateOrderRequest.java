package com.agromarket.application.adapters.api.request.order;

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
}
