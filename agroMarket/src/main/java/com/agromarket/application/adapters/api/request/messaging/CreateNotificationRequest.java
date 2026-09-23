package com.agromarket.application.adapters.api.request.messaging;

import com.agromarket.domain.models.enums.messaging.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuerpo de POST /notifications.
 *
 * <p>
 * IMPORTANTE: {@code @Setter} es obligatorio para que Jackson pueda escribir
 * los campos privados al deserializar el JSON.
 * </p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {
    @NotNull
    @Positive
    private Long recipientId;
    @NotNull
    private NotificationType type;
    @NotBlank
    private String content;
}
