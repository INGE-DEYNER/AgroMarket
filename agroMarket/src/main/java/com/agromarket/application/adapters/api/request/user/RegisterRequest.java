package com.agromarket.application.adapters.api.request.user;

import java.time.LocalDate;
import com.agromarket.domain.models.enums.user.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Size(max=100) String firstName,
        @NotBlank @Size(max=100) String lastName,
        @NotBlank @Email @Size(max=255) String email,
        @NotBlank @Size(min=8, max=128) String password,
        @NotBlank @Size(max=30) String phone,
        @NotNull Role role,
        @Size(max=10) String countryCode,
        @Size(max=255) String location,
        @Size(max=50) String idNumber,
        @Past LocalDate birthDate,
        @Size(max=20) String idType,
        @Size(max=255) String companyName,
        @Size(max=50) String nit,
        Boolean isCompany) {}
