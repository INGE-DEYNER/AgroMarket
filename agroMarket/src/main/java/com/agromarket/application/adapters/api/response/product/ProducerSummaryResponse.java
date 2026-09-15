package com.agromarket.application.adapters.api.response.product;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProducerSummaryResponse {
    private Long id;
    private String name;
    private String companyName;
    private double averageRating;
}