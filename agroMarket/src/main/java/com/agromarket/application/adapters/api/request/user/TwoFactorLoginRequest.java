package com.agromarket.application.adapters.api.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TwoFactorLoginRequest(
        @NotBlank String temporaryToken,
        @NotBlank @Pattern(regexp = "\\d{6}") String code) {}
