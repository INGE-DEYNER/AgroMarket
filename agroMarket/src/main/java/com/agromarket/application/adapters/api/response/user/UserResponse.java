package com.agromarket.application.adapters.api.response.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.user.UserResult;

/**
 * Respuesta pública de un usuario.
 *
 * <p>Refleja el modelo unificado: no expone `approved`/`verifiedProducer`
 * (unificados en {@code accountApproved}), ni `accountStatus`
 * (derivado de `emailVerified` + `accountApproved`), ni
 * `registrationDate` (unificado en `createdAt`), ni `location`
 * (unificado en `department` + `city`), ni `averageRating`/`totalReviews`
 * (se calculan desde `reviews`).</p>
 */
public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Role role,
        boolean active,
        boolean totpEnabled,
        String provider,
        boolean emailVerified,
        String countryCode,
        LocalDate birthDate,
        String idType,
        String companyName,
        Boolean isCompany,
        Boolean accountApproved,
        Boolean accountComplete,
        String department,
        String city,
        String fullAddress,
        String addressReference,
        String postalCode,
        String photoUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String preferredCurrency) {

    public static UserResponse from(UserResult r) {
        return new UserResponse(
                r.getId(),
                r.getFirstName(),
                r.getLastName(),
                r.getEmail(),
                r.getPhone(),
                r.getRole(),
                r.isActive(),
                r.isTotpEnabled(),
                r.getProvider(),
                r.isEmailVerified(),
                r.getCountryCode(),
                r.getBirthDate(),
                r.getIdType(),
                r.getCompanyName(),
                r.getIsCompany(),
                r.getAccountApproved(),
                r.getAccountComplete(),
                r.getDepartment(),
                r.getCity(),
                r.getFullAddress(),
                r.getAddressReference(),
                r.getPostalCode(),
                r.getPhotoUrl(),
                r.getCreatedAt(),
                r.getUpdatedAt(),
                r.getPreferredCurrency());
    }
}
