package com.agromarket.application.adapters.api.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TwoFactorCodeRequest(
        @NotBlank @Pattern(regexp = "\\d{6}") String code) {}
