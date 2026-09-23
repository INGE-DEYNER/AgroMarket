package com.agromarket.application.adapters.api.request.user;

import com.agromarket.domain.models.enums.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoogleOAuth2Request(
        @NotBlank String code,
        @NotNull Role requestedRole) {}
