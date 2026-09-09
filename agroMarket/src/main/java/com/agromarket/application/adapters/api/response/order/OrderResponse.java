package com.agromarket.application.adapters.api.response.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.order.OrderState;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderResponse {
    private Long id;
    private BuyerSummaryResponse buyer;
    private ProductSummaryResponse product;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
    private BigDecimal shippingCost;
    private OrderState state;
    private LocalDateTime createdAt;
    private String checkoutId;
    /**
     * Payment, shipping and invoice are intentionally absent until their subdomains
     * are integrated.
     */
}
