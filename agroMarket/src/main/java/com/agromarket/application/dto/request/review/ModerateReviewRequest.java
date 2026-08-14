package com.agromarket.application.dto.request.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de solicitud para moderar (aprobar/rechazar) una reseña.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerateReviewRequest {
    private boolean approved;
}
