package com.agromarket.application.dto.response.review;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta que representa una reseña de producto.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String buyerName;
    private Integer rating;
    private String comment;
    private LocalDateTime date;

    @Builder.Default
    private boolean approved = true;
}
