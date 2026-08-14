package com.agromarket.application.dto.response.user;

import java.time.LocalDate;

import com.agromarket.domain.user.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa la respuesta con los datos de un usuario.
 * Contiene información básica y extendida del perfil del usuario.
 * 
 * @author AgroMarket Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private Long id;
    private String firstName;
    private String email;
    private String phone;
    private Role role;
    private boolean active;
    private boolean approved;
    private boolean totpEnabled;
    private String location;
    private boolean emailVerified;
    private String provider;
    private String encryptedId;
    private boolean verified;
    private String lastName;
    private String idNumber;
    private LocalDate birthDate;
    private String idType;
    private String companyName;
    private String nit;
    private Boolean isCompany;
    private boolean accountComplete;
    private String accountStatus;
    private String countryCode;
    private String photoUrl;
    private Boolean firstShippingCouponUsed;
    private String preferredCurrency;
    private String department;
    private String city;
    private String fullAddress;
    private String addressReference;
    private String postalCode;
}
