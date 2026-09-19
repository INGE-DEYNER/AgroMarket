package com.agromarket.domain.ports.in.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agromarket.domain.models.enums.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Resultado seguro de consulta de usuario.
 *
 * <p>No expone password, tokens, secreto TOTP ni otros datos
 * de autenticación.</p>
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResult {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private Role role;

    private boolean active;

    private boolean approved;

    private boolean totpEnabled;

    private LocalDateTime registrationDate;

    private String provider;

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

    private String preferredCurrency;
}