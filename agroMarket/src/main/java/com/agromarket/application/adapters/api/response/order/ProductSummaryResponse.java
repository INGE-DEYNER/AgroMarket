package com.agromarket.application.adapters.api.response.order;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private BigDecimal unitPrice;
    private Long producerId;
}
