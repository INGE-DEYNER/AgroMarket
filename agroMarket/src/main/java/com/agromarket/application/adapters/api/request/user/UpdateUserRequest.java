package com.agromarket.application.adapters.api.request.user;

import java.time.LocalDate;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max=100) String firstName,
        @Size(max=100) String lastName,
        @Size(max=30) String phone,
        @Size(max=10) String countryCode,
        @Size(max=255) String location,
        @Size(max=50) String idNumber,
        @Past LocalDate birthDate,
        @Size(max=20) String idType,
        @Size(max=255) String companyName,
        @Size(max=50) String nit,
        Boolean isCompany,
        @Size(max=100) String department,
        @Size(max=100) String city,
        @Size(max=500) String fullAddress,
        @Size(max=255) String addressReference,
        @Size(max=20) String postalCode,
        @Size(max=500) String photoUrl,
        @Size(max=10) String preferredCurrency) {}
