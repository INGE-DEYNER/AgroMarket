package com.agromarket.domain.models.order;

import java.math.BigDecimal;

import com.agromarket.domain.models.product.Product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private Long id;

    private Product product;

    private Integer quantity;

    /**
     * Precio del producto en el momento de realizar la compra.
     */
    private BigDecimal unitPrice;

    /**
     * unitPrice * quantity.
     */
    private BigDecimal subtotal;

    public BigDecimal calculateSubtotal() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }

        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
