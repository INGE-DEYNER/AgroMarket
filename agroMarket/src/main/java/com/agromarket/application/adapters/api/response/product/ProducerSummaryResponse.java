package com.agromarket.application.adapters.api.response.product;

import lombok.*;

/**
 * Resumen del productor que aparece junto a un producto.
 *
 * <p>No expone `averageRating`: la columna `users.average_rating` se
 * eliminó porque nunca se escribía (siempre 0). La reputación real se
 * calcula dinámicamente desde las reseñas de los productos del productor
 * en {@code ProductUseCase}.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProducerSummaryResponse {
    private Long id;
    private String name;
    private String companyName;
}