package com.agromarket.application.adapters.api.request.admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PromoteToAdminRequest(
                @NotNull @Positive Long userId) {
}
