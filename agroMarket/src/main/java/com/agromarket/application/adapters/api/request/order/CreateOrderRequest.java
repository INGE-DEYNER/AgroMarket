package com.agromarket.application.adapters.api.request.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOrderRequest {

    @NotNull
    @Positive
    private Long productId;
    @NotNull
    @Positive
    private Integer quantity;
    @NotNull
    @Positive
    private Long buyerId;

    @NotNull
    @NotBlank
    private String shippingAddress;

}
