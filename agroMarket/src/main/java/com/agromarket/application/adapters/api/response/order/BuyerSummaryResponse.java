package com.agromarket.application.adapters.api.response.order;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyerSummaryResponse {
    private Long id;
    private String name;
    private String email;
}
