package com.agromarket.domain.ports.in.product;
import lombok.*;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateProductStockCommand { private Integer availableQuantity; }