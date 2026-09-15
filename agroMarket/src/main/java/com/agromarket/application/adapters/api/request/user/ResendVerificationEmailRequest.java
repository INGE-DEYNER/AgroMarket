package com.agromarket.application.adapters.api.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendVerificationEmailRequest(@NotBlank @Email String email) {}
