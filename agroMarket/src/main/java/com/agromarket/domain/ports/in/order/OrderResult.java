package com.agromarket.domain.ports.in.order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.order.OrderState;
import com.agromarket.domain.models.product.Product;
import com.agromarket.domain.models.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResult {
    private Long id;
    private User buyer;
    private Product product;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
    private OrderState state;
    private LocalDateTime createdAt;
    private String checkoutId;
}
