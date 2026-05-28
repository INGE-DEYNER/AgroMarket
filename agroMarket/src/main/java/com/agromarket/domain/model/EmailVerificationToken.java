package com.agromarket.domain.model;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailVerificationToken {
    private Long id;
    private Long usuarioId;
    private String token;
    private LocalDateTime expiry;
    private boolean verificado;
    private LocalDateTime createdAt;
}
