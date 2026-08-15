package com.agromarket.application.adapters.persistence.mongodb.documents.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.agromarket.domain.models.enums.user.Role;
import com.agromarket.domain.models.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long domainId;

    @Indexed(unique = true)
    private String email;

    private String firstName;
    private String lastName;
    private String password;
    private String phone;
    private Role role;
    private boolean active;
    private boolean approved;
    private boolean totpEnabled;
    private String totpSecret;
    private LocalDateTime registrationDate;
    private String provider;
    private String providerId;
    private boolean emailVerified;

    private String countryCode;
    private String location;
    private String idNumber;
    private LocalDate birthDate;
    private String idType;
    private String companyName;
    private String nit;
    private Boolean isCompany;

    private Boolean phoneVerified;
    private Boolean accountApproved;
    private Boolean accountComplete;
    private String accountStatus;

    private String emailVerificationToken;
    private LocalDateTime emailTokenExpiry;
    private String phoneVerificationToken;
    private LocalDateTime phoneTokenExpiry;
    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    private String bankAccount;
    private Boolean firstShippingCouponUsed;
    private String preferredCurrency;

    private String department;
    private String city;
    private String fullAddress;
    private String addressReference;
    private String postalCode;
    private String photoUrl;

    private Double averageRating;
    private Integer totalReviews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private Boolean verifiedProducer;

    public User toDomain() {
        return User.builder()
                .id(domainId)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .phone(phone)
                .role(role)
                .active(active)
                .approved(approved)
                .totpEnabled(totpEnabled)
                .totpSecret(totpSecret)
                .registrationDate(registrationDate)
                .provider(provider)
                .providerId(providerId)
                .emailVerified(emailVerified)
                .countryCode(countryCode)
                .location(location)
                .idNumber(idNumber)
                .birthDate(birthDate)
                .idType(idType)
                .companyName(companyName)
                .nit(nit)
                .isCompany(isCompany)
                .phoneVerified(phoneVerified)
                .accountApproved(accountApproved)
                .accountComplete(accountComplete)
                .accountStatus(accountStatus)
                .emailVerificationToken(emailVerificationToken)
                .emailTokenExpiry(emailTokenExpiry)
                .phoneVerificationToken(phoneVerificationToken)
                .phoneTokenExpiry(phoneTokenExpiry)
                .passwordResetToken(passwordResetToken)
                .passwordResetTokenExpiry(passwordResetTokenExpiry)
                .bankAccount(bankAccount)
                .firstShippingCouponUsed(firstShippingCouponUsed)
                .preferredCurrency(preferredCurrency)
                .department(department)
                .city(city)
                .fullAddress(fullAddress)
                .addressReference(addressReference)
                .postalCode(postalCode)
                .photoUrl(photoUrl)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .lastLogin(lastLogin)
                .verifiedProducer(verifiedProducer)
                .build();
    }

    public static UserDocument fromDomain(User user) {
        return UserDocument.builder()
                .id(user.getId() == null ? null : String.valueOf(user.getId()))
                .domainId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .approved(user.isApproved())
                .totpEnabled(user.isTotpEnabled())
                .totpSecret(user.getTotpSecret())
                .registrationDate(user.getRegistrationDate())
                .provider(user.getProvider())
                .providerId(user.getProviderId())
                .emailVerified(user.isEmailVerified())
                .countryCode(user.getCountryCode())
                .location(user.getLocation())
                .idNumber(user.getIdNumber())
                .birthDate(user.getBirthDate())
                .idType(user.getIdType())
                .companyName(user.getCompanyName())
                .nit(user.getNit())
                .isCompany(user.getIsCompany())
                .phoneVerified(user.getPhoneVerified())
                .accountApproved(user.getAccountApproved())
                .accountComplete(user.getAccountComplete())
                .accountStatus(user.getAccountStatus())
                .emailVerificationToken(user.getEmailVerificationToken())
                .emailTokenExpiry(user.getEmailTokenExpiry())
                .phoneVerificationToken(user.getPhoneVerificationToken())
                .phoneTokenExpiry(user.getPhoneTokenExpiry())
                .passwordResetToken(user.getPasswordResetToken())
                .passwordResetTokenExpiry(user.getPasswordResetTokenExpiry())
                .bankAccount(user.getBankAccount())
                .firstShippingCouponUsed(user.getFirstShippingCouponUsed())
                .preferredCurrency(user.getPreferredCurrency())
                .department(user.getDepartment())
                .city(user.getCity())
                .fullAddress(user.getFullAddress())
                .addressReference(user.getAddressReference())
                .postalCode(user.getPostalCode())
                .photoUrl(user.getPhotoUrl())
                .averageRating(user.getAverageRating())
                .totalReviews(user.getTotalReviews())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .verifiedProducer(user.getVerifiedProducer())
                .build();
    }
}
