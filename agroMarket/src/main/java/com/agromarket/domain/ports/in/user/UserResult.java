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
 *
 * <p>Los valores derivados (datos KYC completos, si es empresa) se calculan
 * en el caso de uso a partir del dominio; no se leen de columnas propias
 * porque esas columnas fueron eliminadas al unificar el modelo.</p>
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

    private boolean totpEnabled;

    private String provider;

    private boolean emailVerified;

    private String countryCode;

    private String idNumber;

    private LocalDate birthDate;

    private String idType;

    private String companyName;

    private String nit;

    /** Derivado: true si el usuario tiene razón social registrada. */
    private Boolean isCompany;

    private Boolean accountApproved;

    /** Derivado: true si tiene tipo+número de documento y fecha de nacimiento. */
    private Boolean accountComplete;

    private String department;

    private String city;

    private String fullAddress;

    private String addressReference;

    private String postalCode;

    private String photoUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastLogin;

    private String preferredCurrency;
}