package com.agromarket.application.adapters.api.request.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @NotNull
    @Positive
    private Long senderId;
    @NotNull
    @Positive
    private Long receiverId;
    @NotBlank
    @Size(max = 5000)
    private String content;
}
