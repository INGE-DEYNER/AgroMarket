package com.agromarket.application.adapters.api.response.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.ports.in.user.UserResult;

public record UserResponse(
        Long id, String firstName, String lastName, String email, String phone, Role role,
        boolean active, boolean approved, boolean totpEnabled, LocalDateTime registrationDate,
        String provider, boolean emailVerified, String countryCode, String location,
        LocalDate birthDate, String idType, String companyName,
        Boolean isCompany, Boolean phoneVerified, Boolean accountApproved, Boolean accountComplete,
        String accountStatus, String department, String city, String fullAddress,
        String addressReference, String postalCode, String photoUrl, Double averageRating,
        Integer totalReviews, LocalDateTime createdAt, LocalDateTime updatedAt,
        LocalDateTime lastLogin, Boolean verifiedProducer, String preferredCurrency) {

    public static UserResponse from(UserResult r) {
        return new UserResponse(r.getId(), r.getFirstName(), r.getLastName(), r.getEmail(),
                r.getPhone(), r.getRole(), r.isActive(), r.isApproved(), r.isTotpEnabled(),
                r.getRegistrationDate(), r.getProvider(), r.isEmailVerified(), r.getCountryCode(),
                r.getLocation(), r.getBirthDate(), r.getIdType(),
                r.getCompanyName(), r.getIsCompany(), r.getPhoneVerified(),
                r.getAccountApproved(), r.getAccountComplete(), r.getAccountStatus(),
                r.getDepartment(), r.getCity(), r.getFullAddress(), r.getAddressReference(),
                r.getPostalCode(), r.getPhotoUrl(), r.getAverageRating(), r.getTotalReviews(),
                r.getCreatedAt(), r.getUpdatedAt(), r.getLastLogin(), r.getVerifiedProducer(),
                r.getPreferredCurrency());
    }
}
