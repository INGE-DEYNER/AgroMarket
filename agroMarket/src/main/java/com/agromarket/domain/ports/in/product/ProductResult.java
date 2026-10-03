package com.agromarket.domain.ports.in.product;
import com.agromarket.domain.models.product.Product;
import lombok.*;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResult {
 private Product product; private double averageRating; private long totalReviews;
}