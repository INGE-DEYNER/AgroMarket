package com.agromarket.domain.ports.in.order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateOrderCommand {
    private Long buyerId;
    private Long productId;
    private Integer quantity;
}
